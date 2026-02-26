from django.urls import path
from .views import (
    # Craftsman
    CraftsmanDetailView,
    PublicCraftsmanListView,
    PublicCraftsmanDetailView,

    # Admin - Craftsman
    AdminCraftsmanListView,
    AdminCraftsmanApproveView,
    AdminCraftsmanRejectView,
    AdminCraftsmanUpdateView,
    AdminCraftsmanToggleActiveView,

    # Admin - Product
    AdminProductListView,
    AdminProductApproveView,
    AdminProductRejectView,

    # Services
    ServiceListCreateView,
    ServiceDetailView,
    ServiceCreateView,
    ServiceUpdateDeleteView,

    # Products
    ProductListCreateView,
    ProductDetailView,

    # Job Requests
    JobRequestListCreateView,
    JobRequestDetailView,
    AssignCraftsmanView,
    CraftsmanAcceptJobView,
    StartJobView,
    CompleteJobView,
    AdminApproveJobView,
    MarkJobPaidView,
    CancelJobView,
    SubmitQuoteView,
    SendQuoteView,
    ClientQuoteDecisionView,
    InitiatePaymentView,

    # Reviews
    ReviewListCreateView,
    CraftsmanReviewListView,
    PublicReviewListView,

    # Contact
    ContactMessageCreateView,
)


urlpatterns = [

    # ─── Craftsman ────────────────────────────────────────────────────────────
    path('craftsman/',              CraftsmanDetailView.as_view(),       name='craftsman-detail'),
    path('craftsman/<int:pk>/',     CraftsmanDetailView.as_view(),       name='craftsman-detail-pk'),

    # ─── Public Craftsman ─────────────────────────────────────────────────────
    path('public-craftsman/',              PublicCraftsmanListView.as_view(),   name='public-craftsman-list'),
    path('public-craftsman/<slug:slug>/',  PublicCraftsmanDetailView.as_view(), name='public-craftsman-detail'),

    # ─── Services ─────────────────────────────────────────────────────────────
    path('services/',              ServiceListCreateView.as_view(),    name='service-list-create'),
    path('services/add/',          ServiceCreateView.as_view(),        name='service-add'),
    path('services/<int:pk>/',     ServiceUpdateDeleteView.as_view(),  name='service-detail'),

    # ─── Products ─────────────────────────────────────────────────────────────
    path('products/',              ProductListCreateView.as_view(),    name='product-list-create'),
    path('products/<int:pk>/',     ProductDetailView.as_view(),        name='product-detail'),

    # ─── Admin: Craftsman ─────────────────────────────────────────────────────
    path('admin/craftsman/',                              AdminCraftsmanListView.as_view(),         name='admin-craftsman-list'),
    path('admin/craftsman/<int:pk>/',                     AdminCraftsmanUpdateView.as_view(),       name='admin-craftsman-update'),
    path('admin/craftsman/<int:pk>/approve/',             AdminCraftsmanApproveView.as_view(),      name='admin-craftsman-approve'),
    path('admin/craftsman/<int:pk>/reject/',              AdminCraftsmanRejectView.as_view(),       name='admin-craftsman-reject'),
    path('admin/craftsman/<int:pk>/toggle-active/',       AdminCraftsmanToggleActiveView.as_view(), name='admin-craftsman-toggle-active'),

    # ─── Admin: Products ──────────────────────────────────────────────────────
    path('admin/products/',                        AdminProductListView.as_view(),    name='admin-product-list'),
    path('admin/products/<int:pk>/approve/',       AdminProductApproveView.as_view(), name='admin-product-approve'),
    path('admin/products/<int:pk>/reject/',        AdminProductRejectView.as_view(),  name='admin-product-reject'),

    # ─── Job Requests ─────────────────────────────────────────────────────────
    path('job-requests/',                               JobRequestListCreateView.as_view(),  name='job-request-list'),
    path('job-requests/<int:pk>/',                      JobRequestDetailView.as_view(),      name='job-request-detail'),
    path('job-requests/<int:pk>/assign/',               AssignCraftsmanView.as_view(),       name='job-request-assign'),
    path('job-requests/<int:pk>/accept/',               CraftsmanAcceptJobView.as_view(),    name='job-request-accept'),
    path('job-requests/<int:pk>/start/',                StartJobView.as_view(),              name='job-request-start'),
    path('job-requests/<int:pk>/complete/',             CompleteJobView.as_view(),           name='job-request-complete'),
    path('job-requests/<int:pk>/approve/',              AdminApproveJobView.as_view(),       name='job-request-approve'),
    path('job-requests/<int:pk>/paid/',                 MarkJobPaidView.as_view(),           name='job-request-paid'),
    path('job-requests/<int:pk>/cancel/',               CancelJobView.as_view(),             name='job-request-cancel'),
    path('job-requests/<int:pk>/submit-quote/',         SubmitQuoteView.as_view(),           name='job-request-submit-quote'),
    path('job-requests/<int:pk>/send-quote/',           SendQuoteView.as_view(),             name='job-request-send-quote'),
    path('job-requests/<int:pk>/quote-decision/',       ClientQuoteDecisionView.as_view(),   name='job-request-quote-decision'),
    path('job-requests/<int:pk>/pay/',                  InitiatePaymentView.as_view(),       name='job-request-pay'),

    # ─── Reviews ──────────────────────────────────────────────────────────────
    path('reviews/',                                    ReviewListCreateView.as_view(),      name='review-list-create'),
    path('reviews/public/',                             PublicReviewListView.as_view(),      name='review-public-list'),
    path('craftsman/<int:craftsman_id>/reviews/',       CraftsmanReviewListView.as_view(),   name='craftsman-review-list'),

    # ─── Contact ──────────────────────────────────────────────────────────────
    path('contact/',                                    ContactMessageCreateView.as_view(),  name='contact-create'),

    
]