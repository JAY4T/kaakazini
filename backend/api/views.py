import logging
import json

from django.conf import settings
from django.utils import timezone
from django.db.models import Q

from rest_framework import generics, viewsets, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import (
    Craftsman,
    JobProofImage,
    Product,
    Service,
    JobRequest,
    ContactMessage,
    Review,
)
from .serializers import (
    CraftsmanSerializer,
    ProductSerializer,
    ServiceSerializer,
    JobRequestSerializer,
    ContactMessageSerializer,
    ReviewSerializer,
)
from .permissions import IsOwner
from .payments import send_stk_push
from api.utils import send_craftsman_approval_email


logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def get_job_or_404(pk):
    """Fetch a JobRequest by pk or return None (caller handles the 404 response)."""
    try:
        return JobRequest.objects.get(pk=pk)
    except JobRequest.DoesNotExist:
        return None


def get_craftsman_or_404(pk):
    """Fetch a Craftsman by pk or return None."""
    try:
        return Craftsman.objects.get(pk=pk)
    except Craftsman.DoesNotExist:
        return None


def is_approved_craftsman(user):
    """
    Returns True only if the user has an approved craftsman profile.
    Prevents clients who have a craftsman row (created via get_or_create)
    from being misrouted as craftsmen.
    """
    return (
        hasattr(user, "craftsman")
        and user.craftsman is not None
        and getattr(user.craftsman, "is_approved", False)
    )


# ─────────────────────────────────────────────
# Craftsman Views
# ─────────────────────────────────────────────

class CraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]


class CraftsmanDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = "slug"

    def get_object(self):
        craftsman, _ = Craftsman.objects.get_or_create(user=self.request.user)
        return craftsman

    def patch(self, request, *args, **kwargs):
        craftsman = self.get_object()
        serializer = self.get_serializer(craftsman, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if "service_image" in request.FILES:
            craftsman.service_image = request.FILES["service_image"]
            craftsman.save()

        return Response(self.get_serializer(craftsman).data, status=status.HTTP_200_OK)


class PublicCraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [AllowAny]


class PublicCraftsmanDetailView(generics.RetrieveAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


# ─────────────────────────────────────────────
# Admin: Craftsman Views
# ─────────────────────────────────────────────

class AdminCraftsmanListView(generics.ListAPIView):
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Craftsman.objects.all()
        is_approved = self.request.query_params.get("is_approved")
        search = self.request.query_params.get("search")

        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == "true")
        if search:
            queryset = queryset.filter(user__full_name__icontains=search)
        return queryset


class AdminCraftsmanApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = get_craftsman_or_404(pk)
        if not craftsman:
            return Response({"error": "Craftsman not found"}, status=status.HTTP_404_NOT_FOUND)

        craftsman.status = "approved"
        craftsman.is_approved = True
        craftsman.save()

        try:
            send_craftsman_approval_email(craftsman.user.email, craftsman.user.full_name)
        except Exception as e:
            logger.error(f"Failed to send approval email to {craftsman.user.email}: {e}")

        return Response({"status": "approved"}, status=status.HTTP_200_OK)


class AdminCraftsmanRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = get_craftsman_or_404(pk)
        if not craftsman:
            return Response({"error": "Craftsman not found"}, status=status.HTTP_404_NOT_FOUND)

        craftsman.status = "rejected"
        craftsman.is_approved = False
        craftsman.save()

        return Response({"status": "rejected"}, status=status.HTTP_200_OK)


class AdminCraftsmanUpdateView(generics.UpdateAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAdminUser]

    # Only these fields are editable via admin update
    EDITABLE_FIELDS = ["profession", "description", "primary_service"]

    def patch(self, request, *args, **kwargs):
        craftsman = get_craftsman_or_404(kwargs.get("pk"))
        if not craftsman:
            return Response({"error": "Craftsman not found"}, status=status.HTTP_404_NOT_FOUND)

        for field in self.EDITABLE_FIELDS:
            if field in request.data:
                setattr(craftsman, field, request.data[field])

        craftsman.save()
        return Response(self.get_serializer(craftsman).data, status=status.HTTP_200_OK)


class AdminCraftsmanToggleActiveView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        craftsman = get_craftsman_or_404(pk)
        if not craftsman:
            return Response({"error": "Craftsman not found"}, status=status.HTTP_404_NOT_FOUND)

        craftsman.is_active = not craftsman.is_active
        craftsman.save()

        return Response(
            {
                "message": f'Craftsman is now {"active" if craftsman.is_active else "inactive"}',
                "is_active": craftsman.is_active,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────
# Service Views
# ─────────────────────────────────────────────

class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


class ServiceCreateView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            craftsman = Craftsman.objects.get(user=self.request.user)
        except Craftsman.DoesNotExist:
            raise serializers.ValidationError("Craftsman profile not found.")
        serializer.save(craftsman=craftsman)


class ServiceUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            craftsman = Craftsman.objects.get(user=self.request.user)
            return Service.objects.filter(craftsman=craftsman)
        except Craftsman.DoesNotExist:
            return Service.objects.none()


# ─────────────────────────────────────────────
# Product Views
# ─────────────────────────────────────────────

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Product.objects.filter(craftsman=self.request.user.craftsman)

    def perform_create(self, serializer):
        serializer.save(craftsman=self.request.user.craftsman)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Product.objects.filter(craftsman=self.request.user.craftsman)


# ─────────────────────────────────────────────
# Admin: Product Views
# ─────────────────────────────────────────────

class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


class AdminProductApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        product.status = "approved"
        product.is_approved = True
        product.save()
        return Response({"status": "approved"}, status=status.HTTP_200_OK)


class AdminProductRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        product.status = "rejected"
        product.is_approved = False
        product.save()
        return Response({"status": "rejected"}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# Job Request Views
# ─────────────────────────────────────────────

class JobRequestListCreateView(generics.ListCreateAPIView):
    """
    Routes queryset by role:
    - Admins see all jobs.
    - ?role=client forces client view (safety override).
    - ?role=craftsman forces craftsman view.
    - Auto-detects: only approved craftsmen are routed as craftsmen.
    - Default: treat as client.
    """
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return JobRequest.objects.all().order_by("-created_at")

        role = self.request.query_params.get("role")

        if role == "client":
            return JobRequest.objects.filter(client=user).order_by("-created_at")

        if role == "craftsman":
            if hasattr(user, "craftsman") and user.craftsman is not None:
                return JobRequest.objects.filter(craftsman=user.craftsman).order_by("-created_at")
            return JobRequest.objects.none()

        if is_approved_craftsman(user):
            return JobRequest.objects.filter(craftsman=user.craftsman).order_by("-created_at")

        return JobRequest.objects.filter(client=user).order_by("-created_at")


class JobRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return JobRequest.objects.all()

        if is_approved_craftsman(user):
            return JobRequest.objects.filter(
                Q(craftsman=user.craftsman) | Q(client=user)
            )

        return JobRequest.objects.filter(client=user)


class AssignCraftsmanView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        craftsman_id = request.data.get("craftsman")
        if not craftsman_id:
            return Response({"error": "Craftsman ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        craftsman = get_craftsman_or_404(craftsman_id)
        if not craftsman:
            return Response({"error": "Craftsman not found"}, status=status.HTTP_404_NOT_FOUND)

        job.craftsman = craftsman
        job.status = JobRequest.STATUS_ASSIGNED
        job.save()

        return Response({"message": "Craftsman assigned successfully"}, status=status.HTTP_200_OK)


class CraftsmanAcceptJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        if not is_approved_craftsman(request.user):
            return Response({"error": "Not a craftsman"}, status=status.HTTP_403_FORBIDDEN)

        if job.craftsman != request.user.craftsman:
            return Response({"error": "Job not assigned to you"}, status=status.HTTP_403_FORBIDDEN)

        job.status = JobRequest.STATUS_ACCEPTED
        job.save()

        return Response(JobRequestSerializer(job).data, status=status.HTTP_200_OK)


class StartJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        if not is_approved_craftsman(request.user) or job.craftsman != request.user.craftsman:
            return Response({"error": "This is not your job"}, status=status.HTTP_403_FORBIDDEN)

        job.status = JobRequest.STATUS_IN_PROGRESS
        job.start_time = timezone.now()
        job.save()

        return Response(JobRequestSerializer(job).data, status=status.HTTP_200_OK)


class CompleteJobView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        if not is_approved_craftsman(request.user) or job.craftsman != request.user.craftsman:
            return Response({"error": "This is not your job"}, status=status.HTTP_403_FORBIDDEN)

        for image in request.FILES.getlist("proof_images"):
            JobProofImage.objects.create(job=job, image=image)

        job.end_time = timezone.now()
        job.status = JobRequest.STATUS_COMPLETED
        job.save()

        return Response(
            JobRequestSerializer(job, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class AdminApproveJobView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        job.status = JobRequest.STATUS_APPROVED
        job.save()

        return Response(JobRequestSerializer(job).data, status=status.HTTP_200_OK)


class MarkJobPaidView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        job.status = JobRequest.STATUS_PAID
        job.save()

        return Response(JobRequestSerializer(job).data, status=status.HTTP_200_OK)


class CancelJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user != job.client and not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        job.status = JobRequest.STATUS_CANCELLED
        job.save()

        return Response(JobRequestSerializer(job).data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# Quote Views
# ─────────────────────────────────────────────

class SubmitQuoteView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        if not is_approved_craftsman(request.user) or job.craftsman != request.user.craftsman:
            return Response({"error": "Not authorized to submit quote."}, status=status.HTTP_403_FORBIDDEN)

        quote_file = request.FILES.get("quote_file")
        if quote_file:
            job.quote_file = quote_file

        quote_data = request.data.get("quote_details")
        if quote_data and isinstance(quote_data, str):
            try:
                job.quote_details = json.loads(quote_data)
            except json.JSONDecodeError:
                logger.warning(f"Invalid quote_details JSON for job {pk}")
                return Response({"error": "Invalid quote_details format."}, status=status.HTTP_400_BAD_REQUEST)

        job.status = JobRequest.STATUS_QUOTE_SUBMITTED
        job.save()

        return Response(
            {"detail": "Quote submitted successfully.", "job": JobRequestSerializer(job).data},
            status=status.HTTP_200_OK,
        )


class SendQuoteView(APIView):
    """
    Prepares a quote for delivery (download, WhatsApp, etc.).
    Actual delivery is handled by the frontend.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        if not is_approved_craftsman(request.user) or job.craftsman != request.user.craftsman:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        send_method = request.data.get("send_method", "download")
        base_url = getattr(settings, "FRONTEND_URL", "https://kaakazini.com")

        return Response(
            {
                "success": True,
                "message": f"Quote prepared for {send_method}",
                "quote_link": f"{base_url}/quotes/{job.id}",
            },
            status=status.HTTP_200_OK,
        )


class ClientQuoteDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != job.client:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        decision = request.data.get("decision")
        if decision not in ["approve", "reject"]:
            return Response(
                {"error": "Decision must be 'approve' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        job.quote_approved_by_client = decision == "approve"
        job.status = (
            JobRequest.STATUS_QUOTE_APPROVED
            if decision == "approve"
            else JobRequest.STATUS_PENDING
        )
        job.save()

        return Response(
            {"detail": f"Quote {decision}d successfully.", "job": JobRequestSerializer(job).data},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────
# Payment Views
# ─────────────────────────────────────────────

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if not (user.is_staff or (is_approved_craftsman(user) and job.craftsman == user.craftsman)):
            return Response({"detail": "Not authorized to initiate payment."}, status=status.HTTP_403_FORBIDDEN)

        if not job.craftsman:
            return Response({"detail": "No craftsman assigned to this job."}, status=status.HTTP_400_BAD_REQUEST)

        if not getattr(job.craftsman, "phone_number", None):
            return Response({"detail": "Craftsman phone number is missing."}, status=status.HTTP_400_BAD_REQUEST)

        amount = job.budget or 0
        phone_number = job.craftsman.phone_number

        try:
            success, response_data = send_stk_push(phone_number, amount, job.id)
        except Exception as e:
            logger.error(f"STK Push error for Job {job.id}: {e}")
            return Response(
                {"detail": "Payment initiation failed.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if success:
            job.status = JobRequest.STATUS_PAID
            job.save()
            return Response(
                {"detail": "Payment initiated successfully.", "job": JobRequestSerializer(job).data, "response": response_data},
                status=status.HTTP_200_OK,
            )

        return Response({"detail": "Payment failed.", "response": response_data}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# Review Views
# ─────────────────────────────────────────────

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by("-id")
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class PublicReviewListView(generics.ListAPIView):
    """Read-only public reviews for the landing page. No authentication required."""
    queryset = Review.objects.all().order_by("-id")
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]


class CraftsmanReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Review.objects.filter(craftsman_id=self.kwargs["craftsman_id"]).order_by("-id")


# ─────────────────────────────────────────────
# Contact Views
# ─────────────────────────────────────────────

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
