from datetime import timezone
import logging

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, viewsets, permissions, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser


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
    """
    Allows a craftsman to add a new service to their profile.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        craftsman = Craftsman.objects.get(user=self.request.user)
        serializer.save(craftsman=craftsman)


class ServiceUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    Allows a craftsman to update or delete their own service.
    """
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


# ----------------------------
# NEW: Admin Edit Craftsman View
# ----------------------------
class AdminCraftsmanUpdateView(generics.UpdateAPIView):
    """
    Allows admin to edit craftsman details (full_name, profession, description, primary_service)
    """
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAdminUser]
    
    def patch(self, request, *args, **kwargs):
        try:
            craftsman = self.get_object()
            
            # Update only the fields that are provided
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


# ----------------------------
# NEW: Toggle Active Status View
# ----------------------------
class AdminCraftsmanToggleActiveView(APIView):
    """
    Toggles the is_active status of a craftsman
    """
    permission_classes = [IsAdminUser]
    
    def patch(self, request, pk):
        try:
            craftsman = Craftsman.objects.get(pk=pk)
            
            # Toggle the is_active field
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
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return JobRequest.objects.all().order_by("-created_at")
        if hasattr(user, 'craftsman'):
            return JobRequest.objects.filter(craftsman=user.craftsman).order_by("-created_at")
        return JobRequest.objects.filter(client=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)



class JobRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]




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
            job.assigned_craftsman = craftsman
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

        # Serialize the full job
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
        return Response(serializer.data)  # ✅ return full job object

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
    



# Payment

# ----------------------------
# Initiate Payment View
# ----------------------------
class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]  # craftsman or admin

    def post(self, request, pk, format=None):
        """
        Initiates payment to the craftsman via STK push.
        Admins or the assigned craftsman can trigger payment.
        """
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        # Check permission: admin or assigned craftsman
        if not (user.is_staff or (hasattr(user, 'craftsman') and job.craftsman == user.craftsman)):
            return Response({'detail': 'Not authorized to initiate payment.'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure craftsman and phone number exist
        if not job.craftsman:
            return Response({'detail': 'No craftsman assigned to this job.'}, status=status.HTTP_400_BAD_REQUEST)
        if not job.craftsman.phone_number:
            return Response({'detail': 'Craftsman phone number is missing.'}, status=status.HTTP_400_BAD_REQUEST)

        amount = job.budget or 0
        phone_number = job.craftsman.phone_number

        # Trigger STK Push payment
        try:
            success, response_data = send_stk_push(phone_number, amount, job.id)
        except Exception as e:
            logger.error(f"STK Push error for Job {job.id}: {e}")
            return Response({'detail': 'Payment initiation failed.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Update job status only if payment initiated
        if success:
            job.status = JobRequest.STATUS_PAID  # Use model constant
            job.save()
            serializer = JobRequestSerializer(job)
            return Response({'detail': 'Payment initiated successfully.', 'job': serializer.data, 'response': response_data})
        else:
            return Response({'detail': 'Payment failed.', 'response': response_data}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------
# Submit Quote View
# ----------------------------
class SubmitQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Allows an assigned craftsman to submit a quote for a job request.
        """
        try:
            job = JobRequest.objects.get(pk=pk)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        # Check permission: must be the assigned craftsman
        if not hasattr(user, 'craftsman'):
            return Response({"error": "Not a craftsman."}, status=status.HTTP_403_FORBIDDEN)
        if job.craftsman != user.craftsman:
            return Response({"error": "You are not assigned to this job."}, status=status.HTTP_403_FORBIDDEN)

        quote_data = request.data.get("quote_details")
        if not quote_data:
            return Response({"error": "Quote details are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Save quote and update status
        job.quote_details = quote_data
        job.status = JobRequest.STATUS_QUOTE_SUBMITTED  # consistent with model
        job.save()

        serializer = JobRequestSerializer(job)
        return Response({"detail": "Quote submitted successfully.", "job": serializer.data}, status=status.HTTP_200_OK)




import os
import uuid
import logging
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser

logger = logging.getLogger(__name__)

class UploadImageView(APIView):
    """
    Staging-ready UploadImageView for DigitalOcean Spaces.
    Full debug logging and guaranteed public URL correctness.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        file = request.FILES.get("file")
        folder = request.data.get("folder", "profiles")  # default folder

        if not file:
            logger.error("[UploadImageView] No file provided in request")
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique filename
        ext = os.path.splitext(file.name)[1]
        filename = f"{folder}/{uuid.uuid4()}{ext}"

        try:
            # Save file to Spaces
            saved_path = default_storage.save(filename, ContentFile(file.read()))
            file_url = default_storage.url(saved_path)

            # Verify the file actually exists in Spaces using boto3 client
            s3_client = boto3.client(
                "s3",
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )

            bucket_name = settings.AWS_STORAGE_BUCKET_NAME

            try:
                s3_client.head_object(Bucket=bucket_name, Key=saved_path)
                logger.info(f"[UploadImageView] Successfully uploaded: {saved_path}")
            except ClientError as e:
                logger.error(f"[UploadImageView] File not found in Spaces after upload: {saved_path}")
                return Response(
                    {"error": "File upload failed. File not found in Spaces."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response({"url": file_url, "path": saved_path}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception(f"[UploadImageView] Unexpected error: {str(e)}")
            return Response({"error": "File upload failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
