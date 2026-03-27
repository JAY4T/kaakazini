from django.urls import path
from .views import (
    RegisterView,
    LoginAPIView,
    LogoutAPIView,
    GoogleLoginView,
    AdminLoginAPIView,
    ClientSignupView,
    ClientLoginView,
    MeAPIView,
    OnboardingView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    SwitchRoleView,          # ── NEW
)

urlpatterns = [
    # ── Craftsman ────────────────────────────────────────────────────────
    path("signup/",      RegisterView.as_view(),  name="craftsman-signup"),
    path("login/",       LoginAPIView.as_view(),  name="login"),
    path("onboarding/",  OnboardingView.as_view(), name="onboarding"),

    # ── Client ───────────────────────────────────────────────────────────
    path("client-signup/", ClientSignupView.as_view(), name="client-signup"),
    path("client-login/",  ClientLoginView.as_view(),  name="client-login"),

    # ── Admin ────────────────────────────────────────────────────────────
    path("admin-login/", AdminLoginAPIView.as_view(), name="admin-login"),

    # ── Google OAuth ─────────────────────────────────────────────────────
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),

    # ── Profile / Session ────────────────────────────────────────────────
    path("me/",      MeAPIView.as_view(),   name="me"),
    path("logout/",  LogoutAPIView.as_view(), name="logout"),

    # ── Password reset ───────────────────────────────────────────────────
    path("password-reset/",                      ForgotPasswordAPIView.as_view(), name="password-reset"),
    path("password-reset/<uidb64>/<token>/",     ResetPasswordAPIView.as_view(),  name="password-reset-confirm"),

    # ── NEW: Role switching ───────────────────────────────────────────────
    # POST { "role": "client" } or { "role": "craftsman" }
    path("switch-role/", SwitchRoleView.as_view(), name="switch-role"),
]