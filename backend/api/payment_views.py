# api/payment_views.py
"""
URL wiring (urls.py):
  from .payment_views import ClientPayJobView, PollPaymentStatusView, ConfirmPaymentReceivedView
  path("job-requests/<int:pk>/pay/",            ClientPayJobView.as_view()),
  path("job-requests/<int:pk>/pay-status/",      PollPaymentStatusView.as_view()),
  path("job-requests/<int:pk>/confirm-payment/", ConfirmPaymentReceivedView.as_view()),
"""

import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import JobRequest
from .serializers import JobRequestSerializer
from .intasend_service import initiate_stk_push, check_payment_status, PLATFORM_WALLET_FALLBACK

logger = logging.getLogger(__name__)


def _get_job(pk):
    try:
        return JobRequest.objects.get(pk=pk)
    except JobRequest.DoesNotExist:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 1.  CLIENT PAYS  —  POST /job-requests/{pk}/pay/
# ─────────────────────────────────────────────────────────────────────────────

class ClientPayJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = _get_job(pk)
        if not job:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != job.client and not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        if (job.status or "").lower() == "paid":
            return Response({"detail": "Job already paid."}, status=status.HTTP_400_BAD_REQUEST)

        # ── Phone ──────────────────────────────────────────────────────────
        phone = (
            request.data.get("phone")
            or request.data.get("phone_number")
            or getattr(request.user, "phone_number", None)
            or getattr(request.user, "phone", None)
            or ""
        ).strip()

        if not phone:
            return Response(
                {"detail": "Phone number required. Pass it as 'phone' in the request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Amount ─────────────────────────────────────────────────────────
        try:
            amount = float(request.data.get("amount") or job.budget or 0)
        except (ValueError, TypeError):
            amount = float(job.budget or 0)

        if amount < 1:
            return Response(
                {"detail": "Amount must be at least KES 1. Check that job.budget is set."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Resolve craftsman wallet ────────────────────────────────────────
        craftsman = job.craftsman
        if craftsman and getattr(craftsman, "wallet_id", None):
            wallet_id = craftsman.wallet_id
            logger.info(f"[Payment] Job #{job.id} → craftsman #{craftsman.id} wallet #{wallet_id}")
        else:
            wallet_id = PLATFORM_WALLET_FALLBACK
            logger.warning(
                f"[Payment] Job #{job.id} — craftsman has no wallet_id, "
                f"falling back to platform wallet #{wallet_id}"
            )

        # ── STK push ───────────────────────────────────────────────────────
        result = initiate_stk_push(
            phone_number=phone,
            amount=amount,
            job_id=job.id,
            wallet_id=wallet_id,
            narrative=f"KaaKazini – {job.service or 'Service'}",
        )

        if not result["success"]:
            logger.warning(f"[Payment] STK failed Job #{job.id}: {result.get('error')}")
            return Response(
                {"detail": result.get("error", "Payment failed. Please try again.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction_id = result.get("transaction_id", "")
        if not transaction_id:
            logger.error(
                f"[Payment] STK succeeded but transaction_id is empty! "
                f"Gateway raw response: {result.get('raw')}"
            )
            return Response(
                {"detail": "Payment prompt sent but transaction ID missing — contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        job.intasend_invoice_id = transaction_id
        job.status = JobRequest.STATUS_APPROVED
        job.save(update_fields=["intasend_invoice_id", "status"])
        job.refresh_from_db()

        logger.info(
            f"[Payment] STK sent ✓ Job #{job.id} | tx={job.intasend_invoice_id} | KES {amount}"
        )

        return Response({
            "detail":         "M-Pesa prompt sent. Enter your PIN on your phone.",
            "transaction_id": job.intasend_invoice_id,
            "amount":         amount,
            "job":            JobRequestSerializer(job).data,
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# 2.  POLL STATUS  —  GET /job-requests/{pk}/pay-status/
#
#     Frontend polls this every 2 seconds.
#     Response always contains:
#       payment_status: "COMPLETE" | "FAIL" | "PENDING"
#       failure_reason: human-readable string from gateway (only on FAIL)
# ─────────────────────────────────────────────────────────────────────────────

class PollPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        job = _get_job(pk)
        if not job:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        if not job.intasend_invoice_id:
            return Response(
                {"detail": "No pending transaction for this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = check_payment_status(job.intasend_invoice_id)
        failure_reason = ""

        if result["success"]:
            tx_status = result["status"]   # COMPLETE | FAIL | PENDING

            if tx_status == "COMPLETE" and (job.status or "").lower() != "paid":
                job.status = JobRequest.STATUS_PAID
                job.save(update_fields=["status"])
                logger.info(f"[Poll] Job #{job.id} → marked PAID ✓")

            elif tx_status == "FAIL":
                failure_reason = (
                    result.get("raw", {}).get("data", {}).get("failureReason", "")
                    or "Payment was not completed."
                )
                job.status = JobRequest.STATUS_QUOTE_APPROVED
                job.intasend_invoice_id = ""
                job.save(update_fields=["status", "intasend_invoice_id"])
                logger.info(
                    f"[Poll] Job #{job.id} payment FAILED — "
                    f"reason: {failure_reason} — reset to Quote Approved"
                )

        return Response({
            "job_id":         pk,
            "transaction_id": job.intasend_invoice_id,
            "payment_status": result.get("status", "PENDING"),
            "failure_reason": failure_reason,
            "job_status":     job.status,
            "success":        result["success"],
        })


# ─────────────────────────────────────────────────────────────────────────────
# 3.  CONFIRM CASH  —  POST /job-requests/{pk}/confirm-payment/
# ─────────────────────────────────────────────────────────────────────────────

class ConfirmPaymentReceivedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = _get_job(pk)
        if not job:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_craftsman = (
            hasattr(user, "craftsman")
            and user.craftsman is not None
            and job.craftsman == user.craftsman
        )
        if not is_craftsman and not user.is_staff:
            return Response(
                {"detail": "Only the assigned craftsman can confirm cash payment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        job.status = JobRequest.STATUS_PAID
        job.save(update_fields=["status"])
        logger.info(f"[Payment] Cash confirmed Job #{job.id} by user #{user.id}")

        return Response(
            {"detail": "Payment confirmed. Job closed.", "job": JobRequestSerializer(job).data},
            status=status.HTTP_200_OK,
        )