from django.urls import path
from .views import (
    CraftsmanDetailView, ProductListCreateView, ProductDetailView,
    AdminCraftsmanListView, AdminCraftsmanApproveView, AdminCraftsmanRejectView,
    AdminProductListView, AdminProductApproveView, AdminProductRejectView,  PublicCraftsmanListView,PublicCraftsmanDetailView, ServiceListCreateView, ServiceDetailView,
   ApproveCraftsmanView,ContactMessageCreateView,JobRequestListCreateView, JobRequestDetailView,
    ReviewListCreateView, CraftsmanReviewListView , AssignCraftsmanView,ServiceCreateView,ServiceUpdateDeleteView


)

urlpatterns = [
    # Craftsman
    path('craftsman/', CraftsmanDetailView.as_view(), name='craftsman-detail'),
    path('craftsman/<int:pk>/', CraftsmanDetailView.as_view(), name='craftsman-detail'),

    # service endpoints
    path("services/add/", ServiceCreateView.as_view(), name="service-add"),
    path("services/<int:pk>/", ServiceUpdateDeleteView.as_view(), name="service-edit-delete"),


    # Products
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),



    # Admin - Craftsman
    path('admin/craftsman/', AdminCraftsmanListView.as_view(), name='admin-craftsman-list'),
    path('admin/craftsman/<int:pk>/approve/', AdminCraftsmanApproveView.as_view(), name='admin-craftsman-approve'),
    path('admin/craftsman/<int:pk>/reject/', AdminCraftsmanRejectView.as_view(), name='admin-craftsman-reject'),

    # Admin - Product
    path('admin/products/', AdminProductListView.as_view(), name='admin-product-list'),
    path('admin/products/<int:pk>/approve/', AdminProductApproveView.as_view(), name='admin-product-approve'),
    path('admin/products/<int:pk>/reject/', AdminProductRejectView.as_view(), name='admin-product-reject'),

    # approve 
    path('admin/craftsman/<int:pk>/approve/', ApproveCraftsmanView.as_view(), name='approve_craftsman'),



    # Public craftsman
    path('public-craftsman/', PublicCraftsmanListView.as_view(),name= 'public-craftsman-list'),
    path("public-craftsman/<slug:slug>/", PublicCraftsmanDetailView.as_view(), name="public-craftsman-detail"),


    # services
    path('services/', ServiceListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),


    # client job

    path('job-requests/', JobRequestListCreateView.as_view(), name='job-request-list'),
    path('job-requests/<int:pk>/', JobRequestDetailView.as_view(), name='job-request-detail'),
    path('job-requests/<int:pk>/assign/', AssignCraftsmanView.as_view(), name='assign-craftsman'),


    
    
    # contact us

    path('contact/', ContactMessageCreateView.as_view(), name='submit-contact'),

    # Reviews and Ratings
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('craftsman/<int:craftsman_id>/reviews/', CraftsmanReviewListView.as_view(), name='craftsman-reviews'),





]
