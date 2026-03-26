import logging
import json

from django.conf import settings
from django.utils import timezone
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import serializers

from .models import (
    Craftsman, GalleryImage, JobProofImage, Product, Service,
    JobRequest, ContactMessage, Review, TeamInvite, CraftsmanMember,
)
from .serializers import (
    CraftsmanSerializer, ProductSerializer, ServiceSerializer,
    JobRequestSerializer, ContactMessageSerializer, ReviewSerializer,
    TeamInviteSerializer, CraftsmanMemberSerializer,
)
from .permissions import IsOwner
from api.utils import send_craftsman_approval_email
from .team_notifications import dispatch_invite_notification
from .craftsman_wallet_hook import ensure_craftsman_wallet  # ← new import

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Generic helpers
# ─────────────────────────────────────────────

def get_job_or_404(pk):
    try:
        return JobRequest.objects.get(pk=pk)
    except JobRequest.DoesNotExist:
        return None


def get_craftsman_or_404(pk):
    try:
        return Craftsman.objects.get(pk=pk)
    except Craftsman.DoesNotExist:
        return None


def is_approved_craftsman(user):
    return (
        hasattr(user, "craftsman")
        and user.craftsman is not None
        and getattr(user.craftsman, "is_approved", False)
    )


# ─────────────────────────────────────────────────────────────────────────────
# Profile-save helpers
# ─────────────────────────────────────────────────────────────────────────────

CRAFTSMAN_SCALAR_FIELDS = [
    'description', 'profession', 'location', 'company_name',
    'account_type', 'experience_level', 'primary_service', 'video',
]


def _parse_json_field(request_data, key):
    if hasattr(request_data, 'getlist'):
        values = request_data.getlist(key)
        if not values:
            return None
        raw = values[0] if len(values) == 1 else values
    else:
        raw = request_data.get(key)
        if raw is None:
            return None

    if isinstance(raw, (list, dict)):
        return raw

    if isinstance(raw, str):
        stripped = raw.strip()
        if stripped.startswith('[') or stripped.startswith('{'):
            try:
                return json.loads(stripped)
            except (json.JSONDecodeError, ValueError):
                logger.warning(f"[Profile] Failed to JSON-parse '{key}': {stripped[:100]}")
        return stripped

    return raw


def _save_skills(craftsman, request_data):
    if 'skills' not in request_data:
        return
    parsed = _parse_json_field(request_data, 'skills')
    if isinstance(parsed, list):
        skills_list = [str(s).strip() for s in parsed if str(s).strip()]
    elif isinstance(parsed, str):
        skills_list = [s.strip() for s in parsed.split(',') if s.strip()]
    else:
        skills_list = []
    craftsman.skills = ','.join(skills_list)
    logger.info(f"[Profile] skills → '{craftsman.skills}'")


def _save_services(craftsman, services_data):
    if services_data is None:
        return
    if not isinstance(services_data, list):
        logger.warning(f"[Profile] services is not a list ({type(services_data)}), skipping")
        return

    craftsman.services.all().delete()
    known_choices = {
        choice[0] for choice in Service._meta.get_field('service_name').flatchoices
    }

    for i, svc in enumerate(services_data):
        if not isinstance(svc, dict):
            continue
        name = str(svc.get('name', '')).strip()
        if not name:
            continue
        raw_rate = svc.get('rate')
        try:
            rate = float(raw_rate) if raw_rate not in (None, '', 'null', 'None') else None
        except (ValueError, TypeError):
            rate = None
        unit = str(svc.get('unit', 'fixed')).strip() or 'fixed'

        if name in known_choices:
            Service.objects.create(craftsman=craftsman, service_name=name, custom_name=None, rate=rate, unit=unit)
        else:
            Service.objects.create(craftsman=craftsman, service_name=None, custom_name=name, rate=rate, unit=unit)

        if i == 0:
            craftsman.primary_service = name if name in known_choices else None

    logger.info(f"[Profile] {len(services_data)} services saved for craftsman {craftsman.id}")


def _save_portfolio(craftsman, request):
    remove_ids = _parse_json_field(request.data, 'portfolio_remove_ids')
    if remove_ids and isinstance(remove_ids, list):
        int_ids = []
        for rid in remove_ids:
            try:
                int_ids.append(int(rid))
            except (ValueError, TypeError):
                pass
        if int_ids:
            deleted_count, _ = GalleryImage.objects.filter(
                craftsman=craftsman, id__in=int_ids
            ).delete()
            logger.info(f"[Profile] Deleted {deleted_count} portfolio images")

    new_images = request.FILES.getlist('portfolio_images')
    for img_file in new_images:
        GalleryImage.objects.create(craftsman=craftsman, image=img_file)
    if new_images:
        logger.info(f"[Profile] Added {len(new_images)} portfolio images for craftsman {craftsman.id}")


# ─────────────────────────────────────────────
# Craftsman Views
# ─────────────────────────────────────────────

class CraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]


class CraftsmanDetailView(generics.RetrieveUpdateAPIView):
    """
    GET  → return the logged-in craftsman's full profile.
    PATCH → update profile.
    """
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = "slug"

    def get_object(self):
        craftsman, _ = Craftsman.objects.get_or_create(user=self.request.user)
        return craftsman

    def patch(self, request, *args, **kwargs):
        craftsman = self.get_object()
        data  = request.data
        files = request.FILES

        # ── 1. Scalar fields ──────────────────────────────────────────
        for field in CRAFTSMAN_SCALAR_FIELDS:
            if field in data:
                val = data[field]
                setattr(craftsman, field, val if val != '' else None)

        # ── 2. Profile photo ──────────────────────────────────────────
        if 'profile' in files:
            craftsman.profile = files['profile']

        # ── 3. Proof document ─────────────────────────────────────────
        if 'proof_document' in files:
            craftsman.proof_document = files['proof_document']

        # ── 4. Skills ─────────────────────────────────────────────────
        _save_skills(craftsman, data)

        # ── 5. Save scalar changes ────────────────────────────────────
        craftsman.save()

        # ── 6. Services ───────────────────────────────────────────────
        services_data = _parse_json_field(data, 'services')
        _save_services(craftsman, services_data)
        if services_data is not None:
            Craftsman.objects.filter(pk=craftsman.pk).update(
                primary_service=craftsman.primary_service
            )

        # ── 7. Portfolio ──────────────────────────────────────────────
        _save_portfolio(craftsman, request)

        # ── 8. Return refreshed profile ───────────────────────────────
        craftsman.refresh_from_db()
        serializer = self.get_serializer(craftsman)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        search      = self.request.query_params.get("search")
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

        craftsman.status      = "approved"
        craftsman.is_approved = True
        craftsman.save()

        # ── Create gateway wallet so payments route directly to this craftsman ──
        ensure_craftsman_wallet(craftsman)

        try:
            send_craftsman_approval_email(craftsman.user.email, craftsman.user.full_name)
        except Exception as e:
            logger.error(f"Failed to send approval email: {e}")

        return Response({"status": "approved"}, status=status.HTTP_200_OK)


class AdminCraftsmanRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = get_craftsman_or_404(pk)
        if not craftsman:
            return Response({"error": "Craftsman not found"}, status=status.HTTP_404_NOT_FOUND)
        craftsman.status      = "rejected"
        craftsman.is_approved = False
        craftsman.save()
        return Response({"status": "rejected"}, status=status.HTTP_200_OK)


class AdminCraftsmanUpdateView(generics.UpdateAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAdminUser]
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
            {"message": f'Craftsman is now {"active" if craftsman.is_active else "inactive"}',
             "is_active": craftsman.is_active},
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

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


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
        job.status    = JobRequest.STATUS_ASSIGNED
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
        job.status     = JobRequest.STATUS_IN_PROGRESS
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
        job.status   = JobRequest.STATUS_COMPLETED
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
        if 'quote_file' in request.FILES:
            job.quote_file = request.FILES['quote_file']
        quote_data = request.data.get("quote_details")
        if quote_data and isinstance(quote_data, str):
            try:
                job.quote_details = json.loads(quote_data)
            except json.JSONDecodeError:
                return Response({"error": "Invalid quote_details format."}, status=status.HTTP_400_BAD_REQUEST)
        job.status = JobRequest.STATUS_QUOTE_SUBMITTED
        job.save()
        return Response(
            {"detail": "Quote submitted successfully.", "job": JobRequestSerializer(job).data},
            status=status.HTTP_200_OK,
        )


class SendQuoteView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk):
        job = get_job_or_404(pk)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        if not is_approved_craftsman(request.user) or job.craftsman != request.user.craftsman:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        send_method = request.data.get("send_method", "download")
        base_url    = getattr(settings, "FRONTEND_URL", "https://kaakazini.com")
        return Response(
            {"success": True, "message": f"Quote prepared for {send_method}",
             "quote_link": f"{base_url}/quotes/{job.id}"},
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
            JobRequest.STATUS_QUOTE_APPROVED if decision == "approve"
            else JobRequest.STATUS_PENDING
        )
        job.save()
        return Response(
            {"detail": f"Quote {decision}d successfully.", "job": JobRequestSerializer(job).data},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────
# Payment Views (legacy stub — real payment is in payment_views.py)
# ─────────────────────────────────────────────

class InitiatePaymentView(APIView):
    """Legacy stub — kept so nothing breaks if still imported anywhere."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        return Response(
            {"detail": "Use POST /job-requests/{pk}/pay/ for M-Pesa payment."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ─────────────────────────────────────────────
# Review Views
# ─────────────────────────────────────────────

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by("-id")
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class PublicReviewListView(generics.ListAPIView):
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


# ─────────────────────────────────────────────
# Team: Invites
# ─────────────────────────────────────────────

class TeamInviteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_craftsman(self, user):
        try:
            return Craftsman.objects.get(user=user)
        except Craftsman.DoesNotExist:
            return None

    def get(self, request):
        craftsman = self._get_craftsman(request.user)
        if not craftsman:
            return Response([], status=status.HTTP_200_OK)
        invites = TeamInvite.objects.filter(craftsman=craftsman).exclude(status='revoked')
        return Response(TeamInviteSerializer(invites, many=True).data)

    def post(self, request):
        craftsman = self._get_craftsman(request.user)
        if not craftsman:
            return Response({"detail": "Craftsman profile not found."}, status=status.HTTP_404_NOT_FOUND)

        method  = request.data.get("method", "email")
        contact = request.data.get("contact", "").strip()
        name    = request.data.get("name", "").strip()
        role    = request.data.get("role", "helper")

        if method != "link" and not contact:
            return Response({"detail": "Contact (email or phone) is required."}, status=status.HTTP_400_BAD_REQUEST)

        if contact and TeamInvite.objects.filter(
            craftsman=craftsman, contact=contact,
            status__in=["pending_invite", "pending_approval"],
        ).exists():
            return Response({"detail": "An active invite already exists for this contact."}, status=status.HTTP_400_BAD_REQUEST)

        invite = TeamInvite.objects.create(
            craftsman=craftsman, method=method,
            contact=contact or None, name=name or None,
            role=role, status="pending_invite",
        )
        notification_sent = dispatch_invite_notification(invite)
        if not notification_sent and method != "link":
            logger.warning(f"[TeamInvite] Notification failed for invite #{invite.id} via {method} to {contact}")

        return Response(
            {**TeamInviteSerializer(invite).data, "notification_sent": notification_sent},
            status=status.HTTP_201_CREATED,
        )


class TeamInviteDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            craftsman = Craftsman.objects.get(user=request.user)
        except Craftsman.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            invite = TeamInvite.objects.get(pk=pk, craftsman=craftsman)
        except TeamInvite.DoesNotExist:
            return Response({"detail": "Invite not found."}, status=status.HTTP_404_NOT_FOUND)
        invite.status = "revoked"
        invite.save()
        return Response({"detail": "Invite revoked."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# Team: Members
# ─────────────────────────────────────────────

class TeamMemberListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            craftsman = Craftsman.objects.get(user=request.user)
        except Craftsman.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)
        members = CraftsmanMember.objects.filter(craftsman=craftsman, status="accepted")
        return Response(CraftsmanMemberSerializer(members, many=True).data)


class TeamMemberPendingApprovalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            craftsman = Craftsman.objects.get(user=request.user)
        except Craftsman.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)
        pending = CraftsmanMember.objects.filter(craftsman=craftsman, status="pending_approval")
        return Response(CraftsmanMemberSerializer(pending, many=True).data)


class TeamMemberApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            craftsman = Craftsman.objects.get(user=request.user)
        except Craftsman.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            member = CraftsmanMember.objects.get(pk=pk, craftsman=craftsman)
        except CraftsmanMember.DoesNotExist:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        if member.status != "pending_approval":
            return Response({"detail": f"Member is already '{member.status}'."}, status=status.HTTP_400_BAD_REQUEST)
        member.status = "accepted"
        member.save()
        if member.invite:
            member.invite.status = "accepted"
            member.invite.save()
        _notify_member_approved(member)
        return Response(CraftsmanMemberSerializer(member).data, status=status.HTTP_200_OK)


class TeamMemberRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            craftsman = Craftsman.objects.get(user=request.user)
        except Craftsman.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            member = CraftsmanMember.objects.get(pk=pk, craftsman=craftsman)
        except CraftsmanMember.DoesNotExist:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        member.status = "rejected"
        member.save()
        if member.invite:
            member.invite.status = "rejected"
            member.invite.save()
        return Response({"detail": "Member rejected."}, status=status.HTTP_200_OK)


class TeamMemberDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            craftsman = Craftsman.objects.get(user=request.user)
        except Craftsman.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            member = CraftsmanMember.objects.get(pk=pk, craftsman=craftsman)
        except CraftsmanMember.DoesNotExist:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
        member.delete()
        return Response({"detail": "Member removed."}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Public: Accept Invite via Token
# ─────────────────────────────────────────────

class TeamInviteAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, token):
        try:
            invite = TeamInvite.objects.get(token=token, status="pending_invite")
        except TeamInvite.DoesNotExist:
            return Response({"detail": "Invite link is invalid or has already been used."}, status=status.HTTP_404_NOT_FOUND)

        if invite.craftsman.user == request.user:
            return Response({"detail": "You cannot join your own team."}, status=status.HTTP_400_BAD_REQUEST)

        if CraftsmanMember.objects.filter(craftsman=invite.craftsman, user=request.user).exists():
            return Response({"detail": "You are already a member of this team."}, status=status.HTTP_400_BAD_REQUEST)

        member = CraftsmanMember.objects.create(
            craftsman=invite.craftsman,
            user=request.user,
            invite=invite,
            full_name=request.data.get("full_name") or getattr(request.user, "full_name", ""),
            email=request.data.get("email") or request.user.email,
            phone=request.data.get("phone") or getattr(request.user, "phone_number", ""),
            role=invite.role,
            status="pending_approval",
        )
        invite.status = "pending_approval"
        invite.save()

        return Response(
            {"detail": "Request submitted. You will be notified once the team owner approves you.",
             "member": CraftsmanMemberSerializer(member).data},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
# Private helper — approval notification email
# ─────────────────────────────────────────────

def _notify_member_approved(member):
    import requests as _req
    from django.conf import settings as _s

    api_key = getattr(_s, "BREVO_API_KEY", "")
    if not api_key or not member.email:
        return

    craftsman_name = member.craftsman.full_name or member.craftsman.user.full_name or "Your team owner"
    role           = member.role.capitalize()
    dashboard_url  = f"{getattr(_s, 'FRONTEND_URL', 'https://kaakazini.com')}/dashboard"
    sender_email   = getattr(_s, "BREVO_SENDER_EMAIL", "noreply@kaakazini.com")
    sender_name    = getattr(_s, "BREVO_SENDER_NAME",  "KaaKazini")

    html_content = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#FFD700;margin:0;">&#10003; You've been approved!</h2>
      </div>
      <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
        <p style="font-size:1rem;color:#111827;">Hi <strong>{member.full_name or 'there'}</strong>,</p>
        <p style="color:#374151;">
          <strong>{craftsman_name}</strong> has approved your request to join their
          team on <strong>KaaKazini</strong> as a <strong>{role}</strong>.
        </p>
        <p style="color:#374151;">You can now log in and access the team dashboard.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{dashboard_url}" style="background:#FFD700;color:#0d0d0d;padding:14px 32px;
            border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">
            Go to Dashboard &rarr;
          </a>
        </div>
      </div>
      <div style="background:#f3f4f6;padding:14px 32px;border-radius:0 0 12px 12px;
        font-size:.75rem;color:#9ca3af;text-align:center;">
        KaaKazini &mdash; Kenya's verified craftsman marketplace
      </div>
    </div>
    """

    try:
        _req.post(
            "https://api.brevo.com/v3/smtp/email",
            json={
                "sender": {"name": sender_name, "email": sender_email},
                "to":     [{"email": member.email, "name": member.full_name or ""}],
                "subject": f"You've been approved to join {craftsman_name}'s team",
                "htmlContent": html_content,
            },
            headers={"api-key": api_key, "Content-Type": "application/json"},
            timeout=10,
        ).raise_for_status()
        logger.info(f"[Brevo] Approval email sent to {member.email} (member #{member.id})")
    except Exception as exc:
        logger.error(f"[Brevo] Failed to send approval email to {member.email}: {exc}")