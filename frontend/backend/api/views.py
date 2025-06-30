from rest_framework import generics, permissions
from .models import Craftsman, Product
from .serializers import CraftsmanSerializer, ProductSerializer
from .permissions import IsOwner
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from django.http import Http404
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.generics import RetrieveAPIView
from .models import Service
from .serializers import ServiceSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
# from .models import JobRequest
# from .serializers import ClientSerializer, JobRequestSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import ContactMessage
from .serializers import ContactMessageSerializer











class CraftsmanListView(generics.ListAPIView):
   queryset = Craftsman.objects.all()
   serializer_class = CraftsmanSerializer
   permission_classes = [permissions.IsAuthenticated]


   


class CraftsmanDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CraftsmanSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    
    def get_object(self):
        craftsman, created = Craftsman.objects.get_or_create(user=self.request.user)
        return craftsman


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Product.objects.filter(craftsman=self.request.user.craftsman)

    def perform_create(self, serializer):
        serializer.save(craftsman=self.request.user.craftsman)
        # send_sms_notification(job.assigned_craftsman.phone_number, f"New job request: {job.service}")
        # send_sms_notification(admin_phone_number, f"New job request submitted by {job.client.full_name}")

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

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


class AdminCraftsmanListView(generics.ListAPIView):
    serializer_class = CraftsmanSerializer

    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Craftsman.objects.all()

        # queryset = Craftsman.objects.filter(is_approved=True)
        is_approved = self.request.query_params.get('is_approved')
        search = self.request.query_params.get('search')

        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')

        if search:
            queryset = queryset.filter(full_name__icontains=search)

        return queryset

# Approve Craftsman
class AdminCraftsmanApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = Craftsman.objects.get(pk=pk)
        craftsman.status = 'approved'
        craftsman.is_approved = True
        craftsman.save()
        return Response({'status': 'approved'})

# Reject Craftsman
class AdminCraftsmanRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        craftsman = Craftsman.objects.get(pk=pk)
        craftsman.status = 'rejected'
        craftsman.is_approved = False
        craftsman.save()
        return Response({'status': 'rejected'})

# Admin Product List
class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

# Approve Product
class AdminProductApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        product = Product.objects.get(pk=pk)
        product.status = 'approved'
        product.is_approved = True
        product.save()
        return Response({'status': 'approved'})

# Reject Product
class AdminProductRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        product = Product.objects.get(pk=pk)
        product.status = 'rejected'
        product.is_approved = False
        product.save()
        return Response({'status': 'rejected'})
    



class PublicCraftsmanListView(generics.ListAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['full_name']
    permission_classes = [permissions.AllowAny]



class PublicCraftsmanDetailView(RetrieveAPIView):
    queryset = Craftsman.objects.filter(is_approved=True)
    serializer_class = CraftsmanSerializer
    permission_classes = [permissions.AllowAny]

    lookup_field = 'pk' 
    

class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer




# class ClientDetailView(generics.RetrieveAPIView):
#     queryset = Client.objects.all()
#     serializer_class = ClientSerializer
#     lookup_field = 'id'

# class JobRequestListCreateView(generics.ListCreateAPIView):
#     queryset = JobRequest.objects.all().order_by('-created_at')
#     serializer_class = JobRequestSerializer
#     parser_classes = [MultiPartParser, FormParser]
#     permission_classes = [IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save()


# class JobRequestListCreateView(generics.ListCreateAPIView):
#     queryset = JobRequest.objects.all()
#     serializer_class = JobRequestSerializer
#     permission_classes = [IsAuthenticated]


# class JobRequestUpdateView(generics.UpdateAPIView):
#     queryset = JobRequest.objects.all()
#     serializer_class = JobRequestSerializer
#     lookup_field = 'pk'
   

class ApproveCraftsmanView(generics.UpdateAPIView):
    queryset = Craftsman.objects.all()
    serializer_class = CraftsmanSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = 'approved'
        instance.save()
        return Response({'detail': 'Craftsman approved successfully'}, status=status.HTTP_200_OK)
    

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]  



# views.py
from rest_framework import generics, permissions
from .models import JobRequest
from .serializers import JobRequestSerializer

class JobRequestListCreateView(generics.ListCreateAPIView):
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class JobRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
