from django.urls import path
from .views import (
    RegisterView,         # Craftsman signup
    LoginAPIView,         # Unified login (all roles)
    LogoutAPIView,        # Logout
    GoogleLoginView,      # Google login (craftsman/client)
    AdminLoginAPIView,    # Admin login
    ClientSignupView,     # Client signup
    ClientLoginView,      # Client login
    MeAPIView,            # User profile
)

urlpatterns = [
    # -------------------------------
    # Craftsman endpoints
    # -------------------------------
    path("signup/", RegisterView.as_view(), name="craftsman-signup"),
    path("login/", LoginAPIView.as_view(), name="login"),

    # -------------------------------
    # Client endpoints
    # -------------------------------
    path("client-signup/", ClientSignupView.as_view(), name="client-signup"),
    path("client-login/", ClientLoginView.as_view(), name="client-login"),

    # -------------------------------
    # Admin endpoints
    # -------------------------------
    path("admin-login/", AdminLoginAPIView.as_view(), name="admin-login"),

    # -------------------------------
    # Google OAuth login
    # -------------------------------
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),

    # -------------------------------
    # Profile / Session
    # -------------------------------
    path("me/", MeAPIView.as_view(), name="me"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
]
