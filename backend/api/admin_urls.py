# api/admin_urls.py
# ─────────────────────────────────────────────────────────────────
# All admin endpoints — include this in your main urls.py:
#
#   from api import admin_urls
#   path('api/admin/', include(admin_urls)),
#
# ─────────────────────────────────────────────────────────────────

from django.urls import path
from .admin_views import (
    AdminChangePasswordView,
    AdminProfileView,
    AdminCraftsmanListView,
    AdminCraftsmanApproveView,
    AdminCraftsmanRejectView,
    AdminCraftsmanUpdateView,
    AdminCraftsmanToggleActiveView,
    AdminStaffView,
    AdminStaffToggleView,
    AdminStaffDeleteView,
    AdminJobListView,
    AdminJobAssignView,
    AdminJobPayView,
    AdminSettingsView,
    AdminAnalyticsView,
)

urlpatterns = [
    # ── Profile ──────────────────────────────────────────────────
    path('profile/',                            AdminProfileView.as_view(),                name='admin-profile'),

    # ── Craftsmen ────────────────────────────────────────────────
    path('craftsman/',                          AdminCraftsmanListView.as_view(),          name='admin-craftsman-list'),
    path('craftsman/<int:pk>/',                 AdminCraftsmanUpdateView.as_view(),        name='admin-craftsman-update'),
    path('craftsman/<int:pk>/approve/',         AdminCraftsmanApproveView.as_view(),       name='admin-craftsman-approve'),
    path('craftsman/<int:pk>/reject/',          AdminCraftsmanRejectView.as_view(),        name='admin-craftsman-reject'),
    path('craftsman/<int:pk>/toggle-active/',   AdminCraftsmanToggleActiveView.as_view(),  name='admin-craftsman-toggle'),

    # ── Staff management ─────────────────────────────────────────
    path('staff/',         AdminStaffView.as_view(),  name='admin-staff'),

    path('staff/<int:pk>/toggle/',              AdminStaffToggleView.as_view(),            name='admin-staff-toggle'),
    path('staff/<int:pk>/',        AdminStaffDeleteView.as_view(), name='admin-staff-delete'),


    # ── Jobs ─────────────────────────────────────────────────────
    path('jobs/',                               AdminJobListView.as_view(),                name='admin-job-list'),
    path('jobs/<int:pk>/assign/',               AdminJobAssignView.as_view(),              name='admin-job-assign'),
    path('jobs/<int:pk>/pay/',                  AdminJobPayView.as_view(),                 name='admin-job-pay'),

    # ── Settings ─────────────────────────────────────────────────
    path('settings/',                           AdminSettingsView.as_view(),               name='admin-settings'),

    # ── Analytics ────────────────────────────────────────────────
    path('analytics/',                          AdminAnalyticsView.as_view(),              name='admin-analytics'),
    path('change-password/', AdminChangePasswordView.as_view(), name='admin-change-password'),

]
     