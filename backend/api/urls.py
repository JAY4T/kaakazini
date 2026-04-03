from django.urls import path
from .views import (
    CraftsmanDetailView,
    PublicCraftsmanListView,
    PublicCraftsmanDetailView,
    AdminCraftsmanListView,
    AdminCraftsmanApproveView,
    AdminCraftsmanRejectView,
    AdminCraftsmanUpdateView,
    AdminCraftsmanToggleActiveView,
    AdminProductListView,
    AdminProductApproveView,
    AdminProductRejectView,
    ServiceListCreateView,
    ServiceDetailView,
    ServiceCreateView,
    ServiceUpdateDeleteView,
    ProductListCreateView,
    ProductDetailView,
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
    ReviewListCreateView,
    CraftsmanReviewListView,
    PublicReviewListView,
    ContactMessageCreateView,
    TeamInviteListCreateView,
    TeamInviteDeleteView,
    TeamInviteAcceptView,
    TeamMemberListView,
    TeamMemberPendingApprovalView,
    TeamMemberApproveView,
    TeamMemberRejectView,
    TeamMemberDeleteView,
    CraftsmanAvailabilityListView,
    CraftsmanAvailabilityDetailView,
    BookingRequestCreateView,
    BookingRequestListView,
    BookingRequestRespondView,
    BookingRequestCancelView,
    NotifyMeView,
    NotifyMeDeleteView,
)
from .payment_views import (
    ClientPayJobView,
    PollPaymentStatusView,
    ConfirmPaymentReceivedView,
)

urlpatterns = [

    # ─── Craftsman ────────────────────────────────────────────────────────────
    path('craftsman/',          CraftsmanDetailView.as_view(), name='craftsman-detail'),
    path('craftsman/<int:pk>/', CraftsmanDetailView.as_view(), name='craftsman-detail-pk'),

    # ─── Public Craftsman — SLUG ONLY, no int fallback ────────────────────────
    path('public-craftsman/',             PublicCraftsmanListView.as_view(),   name='public-craftsman-list'),
    path('public-craftsman/<slug:slug>/', PublicCraftsmanDetailView.as_view(), name='public-craftsman-detail'),

    # ─── Services ─────────────────────────────────────────────────────────────
    path('services/',          ServiceListCreateView.as_view(),   name='service-list-create'),
    path('services/add/',      ServiceCreateView.as_view(),       name='service-add'),
    path('services/<int:pk>/', ServiceUpdateDeleteView.as_view(), name='service-detail'),

    # ─── Products ─────────────────────────────────────────────────────────────
    path('products/',          ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(),     name='product-detail'),

    # ─── Admin: Craftsman ─────────────────────────────────────────────────────
    path('admin/craftsman/',                        AdminCraftsmanListView.as_view(),         name='admin-craftsman-list'),
    path('admin/craftsman/<int:pk>/',               AdminCraftsmanUpdateView.as_view(),       name='admin-craftsman-update'),
    path('admin/craftsman/<int:pk>/approve/',       AdminCraftsmanApproveView.as_view(),      name='admin-craftsman-approve'),
    path('admin/craftsman/<int:pk>/reject/',        AdminCraftsmanRejectView.as_view(),       name='admin-craftsman-reject'),
    path('admin/craftsman/<int:pk>/toggle-active/', AdminCraftsmanToggleActiveView.as_view(), name='admin-craftsman-toggle-active'),

    # ─── Admin: Products ──────────────────────────────────────────────────────
    path('admin/products/',                  AdminProductListView.as_view(),    name='admin-product-list'),
    path('admin/products/<int:pk>/approve/', AdminProductApproveView.as_view(), name='admin-product-approve'),
    path('admin/products/<int:pk>/reject/',  AdminProductRejectView.as_view(),  name='admin-product-reject'),

    # ─── Job Requests ─────────────────────────────────────────────────────────
    path('job-requests/',                          JobRequestListCreateView.as_view(), name='job-request-list'),
    path('job-requests/<int:pk>/',                 JobRequestDetailView.as_view(),     name='job-request-detail'),
    path('job-requests/<int:pk>/assign/',          AssignCraftsmanView.as_view(),      name='job-request-assign'),
    path('job-requests/<int:pk>/accept/',          CraftsmanAcceptJobView.as_view(),   name='job-request-accept'),
    path('job-requests/<int:pk>/start/',           StartJobView.as_view(),             name='job-request-start'),
    path('job-requests/<int:pk>/complete/',        CompleteJobView.as_view(),          name='job-request-complete'),
    path('job-requests/<int:pk>/approve/',         AdminApproveJobView.as_view(),      name='job-request-approve'),
    path('job-requests/<int:pk>/paid/',            MarkJobPaidView.as_view(),          name='job-request-paid'),
    path('job-requests/<int:pk>/cancel/',          CancelJobView.as_view(),            name='job-request-cancel'),
    path('job-requests/<int:pk>/submit-quote/',    SubmitQuoteView.as_view(),          name='job-request-submit-quote'),
    path('job-requests/<int:pk>/send-quote/',      SendQuoteView.as_view(),            name='job-request-send-quote'),
    path('job-requests/<int:pk>/quote-decision/',  ClientQuoteDecisionView.as_view(),  name='job-request-quote-decision'),
    path('job-requests/<int:pk>/pay/',             ClientPayJobView.as_view(),         name='job-request-pay'),
    path('job-requests/<int:pk>/confirm-payment/', ConfirmPaymentReceivedView.as_view(), name='job-request-confirm-payment'),
    path('job-requests/<int:pk>/pay-status/',      PollPaymentStatusView.as_view(),    name='job-request-pay-status'),

    # ─── Reviews ──────────────────────────────────────────────────────────────
    path('reviews/',                           ReviewListCreateView.as_view(),    name='review-list-create'),
    path('reviews/public/',                    PublicReviewListView.as_view(),    name='review-public-list'),
    path('craftsman/<int:craftsman_id>/reviews/', CraftsmanReviewListView.as_view(), name='craftsman-review-list'),

    # ─── Contact ──────────────────────────────────────────────────────────────
    path('contact/', ContactMessageCreateView.as_view(), name='contact-create'),

    # ─── Team: Invites ────────────────────────────────────────────────────────
    path('craftsman/invites/',                     TeamInviteListCreateView.as_view(), name='team-invite-list-create'),
    path('craftsman/invites/<int:pk>/',            TeamInviteDeleteView.as_view(),     name='team-invite-delete'),
    path('craftsman/invites/accept/<uuid:token>/', TeamInviteAcceptView.as_view(),     name='team-invite-accept'),

    # ─── Team: Members ────────────────────────────────────────────────────────
    path('craftsman/members/',                       TeamMemberListView.as_view(),            name='team-member-list'),
    path('craftsman/members/pending-approval/',      TeamMemberPendingApprovalView.as_view(), name='team-member-pending'),
    path('craftsman/members/<int:pk>/approve/',      TeamMemberApproveView.as_view(),         name='team-member-approve'),
    path('craftsman/members/<int:pk>/reject/',       TeamMemberRejectView.as_view(),          name='team-member-reject'),
    path('craftsman/members/<int:pk>/',              TeamMemberDeleteView.as_view(),          name='team-member-delete'),

    # ─── Availability ─────────────────────────────────────────────────────────
    path('craftsmen/availability/',            CraftsmanAvailabilityListView.as_view(),   name='craftsmen-availability'),
    path('craftsmen/<int:pk>/availability/',   CraftsmanAvailabilityDetailView.as_view(), name='craftsman-availability-detail'),

    # ─── Notify Me ────────────────────────────────────────────────────────────
    path('craftsmen/notify-me/',                   NotifyMeView.as_view(),       name='notify-me-create'),
    path('craftsmen/<int:craftsman_pk>/notify-me/', NotifyMeDeleteView.as_view(), name='notify-me-delete'),

    # ─── Booking Requests ─────────────────────────────────────────────────────
    path('bookings/',                BookingRequestCreateView.as_view(),  name='booking-create'),
    path('bookings/list/',           BookingRequestListView.as_view(),    name='booking-list'),
    path('bookings/<int:pk>/respond/', BookingRequestRespondView.as_view(), name='booking-respond'),
    path('bookings/<int:pk>/cancel/',  BookingRequestCancelView.as_view(),  name='booking-cancel'),
]