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
    ContactMessage, Review
)
from .serializers import (
    CraftsmanSerializer, ProductSerializer,
    ServiceSerializer, JobRequestSerializer,
    ContactMessageSerializer, ReviewSerializer
)
from .permissions import IsOwner
from api.utils import send_craftsman_approval_email

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
    permission_classes = [IsAuthenticated, IsOwner]

    def get_object(self):
        craftsman, _created = Craftsman.objects.get_or_create(user=self.request.user)
        return craftsman


class PublicCraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['profession']


class PublicCraftsmanDetailView(RetrieveAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'


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
        if hasattr(user, 'craftsman'):
            return JobRequest.objects.filter(craftsman=user.craftsman).order_by("-created_at")
        return JobRequest.objects.filter(client=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class JobRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]


class AssignCraftsmanView(generics.UpdateAPIView):
    """
    Allows an admin to assign a craftsman to a specific job request.
    """
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [IsAdminUser]

    def update(self, request, *args, **kwargs):
        job_id = kwargs.get("pk")
        try:
            job = self.get_queryset().get(pk=job_id)
        except JobRequest.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        craftsman_id = request.data.get("craftsman_id")
        if not craftsman_id:
            return Response({"error": "Craftsman ID required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            craftsman = Craftsman.objects.get(id=craftsman_id, is_approved=True)
        except Craftsman.DoesNotExist:
            return Response({"error": "Craftsman not found or not approved"}, status=status.HTTP_404_NOT_FOUND)

        job.craftsman = craftsman
        job.status = "Assigned"
        job.save()

        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
