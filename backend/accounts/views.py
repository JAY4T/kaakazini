import os
import logging
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import CustomUser
from .serializers import (
    CraftsmanSignupSerializer,
    ClientSignupSerializer,
    RoleLoginSerializer,
    UserProfileSerializer,
)
from .utils import complete_signup, send_welcome_email

logger = logging.getLogger(__name__)
User = get_user_model()
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

# -----------------------------
# Signup Views
# -----------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = CraftsmanSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        complete_signup(user)
        send_welcome_email(user.email, user.full_name)  # consider async in production

class ClientSignupView(generics.CreateAPIView):
    serializer_class = ClientSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user.email, user.full_name)  # consider async

# -----------------------------
# Unified Login View
# -----------------------------
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    # TODO: add throttling in production
    def post(self, request):
        serializer = RoleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']

        response = Response({
            "detail": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            }
        })

        # JWT cookies (secure + SameSite Strict)
        return set_auth_cookies(response, user)
# -----------------------------
# Admin Login
# -----------------------------
class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RoleLoginSerializer(data={**request.data, "role": "admin"})
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']

        # Ensure role is correct
        if user.is_staff and user.role != "admin":
            user.role = "admin"
            user.save(update_fields=["role"])

        response = Response({
            "detail": "Admin login successful",
            "email": user.email,
            "is_staff": True,
            "role": user.role,
        })
        return set_auth_cookies(response, user)


# -----------------------------
# Client Login (optional)
# -----------------------------
class ClientLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RoleLoginSerializer(data={**request.data, "role": "client"})
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']
        remember = request.data.get("remember", False)

        response = Response({
            "detail": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            }
        })
        return set_auth_cookies(response, user, remember=remember)

# -----------------------------
# Google Login (role-aware)
# -----------------------------
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    # TODO: add throttling in production
    def post(self, request):
        token = request.data.get("token")
        role = request.data.get("role")  # "craftsman" or "client"

        if not token:
            return Response({"detail": "No token provided"}, status=400)
        if role not in ['craftsman', 'client']:
            return Response({"detail": "Invalid role for Google login"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo["email"]
            full_name = idinfo.get("name", "")

            # ✅ Only assign role on creation
            user, created = CustomUser.objects.get_or_create(email=email)
            if created:
                user.full_name = full_name or user.full_name
                user.role = role
                user.save()
                send_welcome_email(user.email, user.full_name)  # consider async

            response = Response({
                "detail": "Google login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role,
                },
                "created": created,
            })
            return set_auth_cookies(response, user)

        except Exception as e:
            logger.error(f"Google login failed: {e}")
            return Response({"detail": "Invalid Google token"}, status=400)

# -----------------------------
# Logout
# -----------------------------
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Logged out"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

# -----------------------------
# Profile / Me
# -----------------------------
class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

# -----------------------------
# Helpers
# -----------------------------
def set_auth_cookies(response, user, remember=False):
    """
    Set JWT access + refresh tokens in cookies.
    """
    refresh = RefreshToken.for_user(user)

    access_max_age = 30 * 60 if not remember else 7 * 24 * 60 * 60
    refresh_max_age = 24 * 60 * 60 if not remember else 7 * 24 * 60 * 60

    # ✅ DEVELOPMENT SETTINGS (for localhost)
    response.set_cookie(
        "access_token", 
        str(refresh.access_token),
        httponly=True, 
        secure=False,      # False for development (localhost)
        samesite="Lax",    # Lax allows cross-port requests
        max_age=access_max_age, 
        path="/"
    )
    response.set_cookie(
        "refresh_token", 
        str(refresh), 
        httponly=True, 
        secure=False,      # False for development (localhost)
        samesite="Lax",    # Lax allows cross-port requests
        max_age=refresh_max_age, 
        path="/"
    )
    return response
