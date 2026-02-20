from datetime import timezone
import logging
import json
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, viewsets, permissions, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


from .models import (
    Craftsman, Product, Service, JobRequest,
    ContactMessage, Review, ServiceVideo,
)
from .serializers import (
    CraftsmanSerializer, ProductSerializer,
    ServiceSerializer, JobRequestSerializer,
    ContactMessageSerializer, ReviewSerializer
)
from .permissions import IsOwner
from api.utils import send_craftsman_approval_email
from .serializers import JobRequestSerializer
from .models import JobRequest
from django.utils import timezone
from .payments import send_stk_push  
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid
import os



logger = logging.getLogger(__name__)


# ----------------------------
# Helper: Detect user role
# ----------------------------
def is_craftsman(user):
    """
    Returns True only if the user has an approved/active craftsman profile.
    Prevents clients who happen to have a craftsman row from being misrouted.
    """
    return (
        hasattr(user, "craftsman") and
        user.craftsman is not None and
        getattr(user.craftsman, "is_approved", False)
    )


# ----------------------------
# Craftsman Views
# ----------------------------
class CraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]


class CraftsmanDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'slug'

    def get_object(self):
        craftsman, _ = Craftsman.objects.get_or_create(user=self.request.user)
        return craftsman

    def patch(self, request, *args, **kwargs):
        craftsman = self.get_object()

        serializer = self.get_serializer(craftsman, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if 'service_image' in request.FILES:
            craftsman.service_image = request.FILES['service_image']
            craftsman.save()

        return Response(self.get_serializer(craftsman).data, status=status.HTTP_200_OK)


class ServiceCreateView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        craftsman = Craftsman.objects.get(user=self.request.user)
        serializer.save(craftsman=craftsman)


class ServiceUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        craftsman = Craftsman.objects.get(user=self.request.user)
        return Service.objects.filter(craftsman=craftsman)


# Public list
class PublicCraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [permissions.AllowAny]

# Public detail by slug
class PublicCraftsmanDetailView(generics.RetrieveAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class AdminCraftsmanListView(generics.ListAPIView):
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Craftsman.objects.all()
        is_approved = self.request.query_params.get('is_approved')
        search = self.request.query_params.get('search')

        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
        if search:
            queryset = queryset.filter(full_name__icontains=search)
        return queryset


class AdminCraftsmanApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = Craftsman.objects.get(pk=pk)
        craftsman.status = 'approved'
        craftsman.is_approved = True
        craftsman.save()
        try:
            send_craftsman_approval_email(craftsman.user.email, craftsman.full_name)
        except Exception as e:
            logger.error(f"Failed to send approval email to {craftsman.user.email}: {e}")
        return Response({'status': 'approved'})


class AdminCraftsmanRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = Craftsman.objects.get(pk=pk)
        craftsman.status = 'rejected'
        craftsman.is_approved = False
        craftsman.save()
        return Response({'status': 'rejected'})


class ApproveCraftsmanView(generics.UpdateAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = 'approved'
        instance.save()
        return Response({'detail': 'Craftsman approved successfully'}, status=status.HTTP_200_OK)


class AdminCraftsmanUpdateView(generics.UpdateAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAdminUser]
    
    def patch(self, request, *args, **kwargs):
        try:
            craftsman = self.get_object()
            
            if 'full_name' in request.data:
                craftsman.full_name = request.data['full_name']
            if 'profession' in request.data:
                craftsman.profession = request.data['profession']
            if 'description' in request.data:
                craftsman.description = request.data['description']
            if 'primary_service' in request.data:
                craftsman.primary_service = request.data['primary_service']
            
            craftsman.save()
            
            serializer = self.get_serializer(craftsman)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Craftsman.DoesNotExist:
            return Response(
                {'error': 'Craftsman not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating craftsman {kwargs.get('pk')}: {e}")
            return Response(
                {'error': 'Failed to update craftsman'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminCraftsmanToggleActiveView(APIView):
    permission_classes = [IsAdminUser]
    
    def patch(self, request, pk):
        try:
            craftsman = Craftsman.objects.get(pk=pk)
            craftsman.is_active = not craftsman.is_active
            craftsman.save()
            
            serializer = CraftsmanSerializer(craftsman)
            return Response(
                {
                    'message': f'Craftsman is now {"active" if craftsman.is_active else "inactive"}',
                    'craftsman': serializer.data
                }, 
                status=status.HTTP_200_OK
            )
        except Craftsman.DoesNotExist:
            return Response(
                {'error': 'Craftsman not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error toggling active status for craftsman {pk}: {e}")
            return Response(
                {'error': 'Failed to toggle active status'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ----------------------------
# Product Views
# ----------------------------
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


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'craftsman'):
            return Product.objects.filter(craftsman=user.craftsman)
        return Product.objects.none()

    def perform_create(self, serializer):
        serializer.save(craftsman=self.request.user.craftsman)


class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


class AdminProductApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        product = Product.objects.get(pk=pk)
        product.status = 'approved'
        product.is_approved = True
        product.save()
        return Response({'status': 'approved'})


class AdminProductRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        product = Product.objects.get(pk=pk)
        product.status = 'rejected'
        product.is_approved = False
        product.save()
        return Response({'status': 'rejected'})


# ----------------------------
# Service Views
# ----------------------------
class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


# ----------------------------
# JobRequest Views
# ----------------------------

class JobRequestListCreateView(generics.ListCreateAPIView):
    """
    ✅ FIXED: Properly routes by role using explicit role check.

    The bug: `hasattr(user, "craftsman")` returned True for clients
    because CraftsmanDetailView uses get_or_create — creating a Craftsman
    row for every user. This caused clients to be routed into the craftsman
    branch and receive an empty list.

    The fix: Only treat a user as a craftsman if their craftsman profile
    is actually approved (is_approved=True). Otherwise fall back to client.

    Also supports explicit ?role=client override for safety.
    """
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # 1. Admins see everything
        if user.is_staff or user.is_superuser:
            return JobRequest.objects.all().order_by("-created_at")

        # 2. Allow explicit role override via query param
        role = self.request.query_params.get("role")

        if role == "client":
            # Force client view regardless of craftsman profile
            return JobRequest.objects.filter(client=user).order_by("-created_at")

        if role == "craftsman":
            if hasattr(user, "craftsman") and user.craftsman is not None:
                return JobRequest.objects.filter(craftsman=user.craftsman).order_by("-created_at")
            return JobRequest.objects.none()

        # 3. Auto-detect: only treat as craftsman if profile is approved
        if (
            hasattr(user, "craftsman") and
            user.craftsman is not None and
            getattr(user.craftsman, "is_approved", False)
        ):
            return JobRequest.objects.filter(craftsman=user.craftsman).order_by("-created_at")

        # 4. Default: treat as client
        return JobRequest.objects.filter(client=user).order_by("-created_at")


class JobRequestDetailView(generics.RetrieveUpdateAPIView):
    """
    ✅ FIXED: Clients can retrieve and update their own jobs.
    """
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return JobRequest.objects.all()

        # Approved craftsman: see assigned jobs
        if (
            hasattr(user, "craftsman") and
            user.craftsman is not None and
            getattr(user.craftsman, "is_approved", False)
        ):
            # Also include jobs where user is the client (craftsman can also be a client)
            from django.db.models import Q
            return JobRequest.objects.filter(
                Q(craftsman=user.craftsman) | Q(client=user)
            )

        # Default: client sees own jobs
        return JobRequest.objects.filter(client=user)


class AssignCraftsmanView(APIView):
    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
            craftsman_id = request.data.get('craftsman')
            
            if not craftsman_id:
                return Response(
                    {'error': 'Craftsman ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            craftsman = Craftsman.objects.get(pk=craftsman_id)
            job.craftsman = craftsman
            job.status = JobRequest.STATUS_ASSIGNED  
            job.save()

            return Response(
                {'message': 'Craftsman assigned successfully'}, 
                status=status.HTTP_200_OK
            )
        except JobRequest.DoesNotExist:
            return Response(
                {'error': 'Job not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Craftsman.DoesNotExist:
            return Response(
                {'error': 'Craftsman not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CraftsmanJobListView(generics.ListAPIView):
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'craftsman'):
            return JobRequest.objects.filter(craftsman=user.craftsman)
        return JobRequest.objects.none()


# ----------------------------
# Review Views
# ----------------------------
class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class CraftsmanReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        craftsman_id = self.kwargs['craftsman_id']
        return Review.objects.filter(craftsman_id=craftsman_id)


# ----------------------------
# Contact Message Views
# ----------------------------
class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]


class CraftsmanAcceptJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        if not hasattr(request.user, 'craftsman'):
            return Response({"error": "Not a craftsman"}, status=403)

        if job.craftsman != request.user.craftsman:
            return Response({"error": "Job not assigned to you"}, status=403)

        job.status = JobRequest.STATUS_ACCEPTED
        job.save()

        serializer = JobRequestSerializer(job)
        return Response(serializer.data)


class StartJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        if job.craftsman != request.user.craftsman:
            return Response({"error": "This is not your job"}, status=403)

        job.status = JobRequest.STATUS_IN_PROGRESS
        job.start_time = timezone.now()
        job.save()

        serializer = JobRequestSerializer(job)  
        return Response(serializer.data)       
    
class CompleteJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        if job.craftsman != request.user.craftsman:
            return Response({"error": "This is not your job"}, status=403)

        job.end_time = timezone.now()
        job.status = JobRequest.STATUS_COMPLETED
        job.save()

        serializer = JobRequestSerializer(job)
        return Response(serializer.data)


class AdminApproveJobView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        job.status = JobRequest.STATUS_APPROVED
        job.save()

        serializer = JobRequestSerializer(job)
        return Response(serializer.data)

class MarkJobPaidView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        job.status = JobRequest.STATUS_PAID
        job.save()

        serializer = JobRequestSerializer(job)
        return Response(serializer.data)

class CancelJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        if request.user != job.client and not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=403)

        job.status = JobRequest.STATUS_CANCELLED
        job.save()

        serializer = JobRequestSerializer(job)
        return Response(serializer.data)
    

# ----------------------------
# Payment Views
# ----------------------------
class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, format=None):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        if not (user.is_staff or (hasattr(user, 'craftsman') and job.craftsman == user.craftsman)):
            return Response({'detail': 'Not authorized to initiate payment.'}, status=status.HTTP_403_FORBIDDEN)

        if not job.craftsman:
            return Response({'detail': 'No craftsman assigned to this job.'}, status=status.HTTP_400_BAD_REQUEST)
        if not job.craftsman.phone_number:
            return Response({'detail': 'Craftsman phone number is missing.'}, status=status.HTTP_400_BAD_REQUEST)

        amount = job.budget or 0
        phone_number = job.craftsman.phone_number

        try:
            success, response_data = send_stk_push(phone_number, amount, job.id)
        except Exception as e:
            logger.error(f"STK Push error for Job {job.id}: {e}")
            return Response({'detail': 'Payment initiation failed.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if success:
            job.status = JobRequest.STATUS_PAID
            job.save()
            serializer = JobRequestSerializer(job)
            return Response({'detail': 'Payment initiated successfully.', 'job': serializer.data, 'response': response_data})
        else:
            return Response({'detail': 'Payment failed.', 'response': response_data}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------
# ✅ Submit Quote View
# ----------------------------
class SubmitQuoteView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found."}, status=404)

        if not hasattr(request.user, "craftsman") or job.craftsman != request.user.craftsman:
            return Response({"error": "Not authorized to submit quote."}, status=403)

        logger.info(f"SubmitQuote FILES: {list(request.FILES.keys())}")
        logger.info(f"SubmitQuote DATA: {list(request.data.keys())}")

        # ✅ quote_file is optional — save JSON details even without a file
        quote_file = request.FILES.get("quote_file")
        if quote_file:
            job.quote_file = quote_file

        quote_data = request.data.get("quote_details")
        if quote_data and isinstance(quote_data, str):
            try:
                job.quote_details = json.loads(quote_data)
            except json.JSONDecodeError:
                logger.warning("Invalid quote_details JSON")

        job.status = JobRequest.STATUS_QUOTE_SUBMITTED
        job.save()

        serializer = JobRequestSerializer(job)
        return Response({
            "detail": "Quote submitted successfully",
            "job": serializer.data
        }, status=200)


# ----------------------------
# ✅ Send Quote View
# ----------------------------
class SendQuoteView(APIView):
    """
    Accepts JSON or multipart — returns success so frontend
    can handle the actual delivery (WhatsApp, download, etc.)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        user = request.user
        if not hasattr(user, "craftsman") or job.craftsman != user.craftsman:
            return Response({"error": "Not authorized"}, status=403)

        send_method = request.data.get('send_method', 'download')
        
        return Response({
            "success": True,
            "message": f"Quote prepared for {send_method}",
            "quote_link": f"https://staging.kaakazini.com/quotes/{job.id}"
        }, status=200)


# ----------------------------
# Client Quote Decision View
# ----------------------------
class ClientQuoteDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found."}, status=404)

        if request.user != job.client:
            return Response({"error": "Not authorized"}, status=403)

        decision = request.data.get("decision")
        if decision not in ["approve", "reject"]:
            return Response({"error": "Decision must be 'approve' or 'reject'."}, status=400)

        job.quote_approved_by_client = True if decision == "approve" else False
        job.status = JobRequest.STATUS_QUOTE_APPROVED if decision == "approve" else JobRequest.STATUS_PENDING
        job.save()

        serializer = JobRequestSerializer(job)
        return Response({
            "detail": f"Quote {decision}d successfully",
            "job": serializer.data
        }, status=200)
