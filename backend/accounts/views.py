import os
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sib_api_v3_sdk import ApiClient, Configuration
from sib_api_v3_sdk.api import transactional_emails_api
from sib_api_v3_sdk.models import SendSmtpEmail

from .models import CustomUser
from .serializers import (
    CraftsmanSignupSerializer,
    ClientSignupSerializer,
    RoleLoginSerializer,
    UserProfileSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")  # fallback for local dev
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")


# -----------------------------
# Email Utilities
# -----------------------------
def send_welcome_email(email: str, full_name: str, html_content: str = None):
    """
    Send a transactional email via Brevo API.
    """
    if not BREVO_API_KEY:
        logger.error("BREVO_API_KEY not set")
        return

    try:
        configuration = Configuration()
        configuration.api_key["api-key"] = BREVO_API_KEY
        api_instance = transactional_emails_api.TransactionalEmailsApi(ApiClient(configuration))

        content = SendSmtpEmail(
            sender={"name": "KaaKazini", "email": "noreply@kaakazini.com"},
            reply_to={"name": "Kaakazini", "email": "support@kaakazini.com"},
            to=[{"email": email, "name": full_name or "User"}],
            subject="Welcome to Kaakazini!!" if html_content is None else "Kaakazini ",
            html_content=html_content or f"""
                <p>Hi {full_name or 'User'},</p>
                <p>Welcome to <b>Kaakazini</b>!</p>
                <p>Your account has been created successfully.</p>
                <br>
                <p>Best regards,<br>Team JAY4T</p>
            """,
        )

        api_instance.send_transac_email(content)
        logger.info(f"Brevo email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send Brevo email to {email}: {e}")


def complete_signup(user):
    """
    Sends welcome email via Brevo API.
    """
    send_welcome_email(user.email, user.full_name)
    return True  # cookies handle auth, no tokens needed here


# -----------------------------
# Auth Helper
# -----------------------------
def set_auth_cookies(response, user, remember=False):
    refresh = RefreshToken.for_user(user)

    access_max_age = 30 * 60 if not remember else 7 * 24 * 60 * 60
    refresh_max_age = 24 * 60 * 60 if not remember else 7 * 24 * 60 * 60

    response.set_cookie(
        "access_token",
        str(refresh.access_token),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=access_max_age,
        path="/"
    )
    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=refresh_max_age,
        path="/"
    )
    return response


# -----------------------------
# Signup Views
# -----------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = CraftsmanSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        complete_signup(user)


class ClientSignupView(generics.CreateAPIView):
    serializer_class = ClientSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        complete_signup(user)


# -----------------------------
# Login Views
# -----------------------------
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

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
        return set_auth_cookies(response, user)


class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RoleLoginSerializer(data={**request.data, "role": "admin"})
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']

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


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        role = request.data.get("role")

        if not token:
            return Response({"detail": "No token provided"}, status=400)
        if role not in ['craftsman', 'client']:
            return Response({"detail": "Invalid role for Google login"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo["email"]
            full_name = idinfo.get("name", "")

            user, created = CustomUser.objects.get_or_create(email=email)
            if created:
                user.full_name = full_name or user.full_name
                user.role = role
                user.save()
                send_welcome_email(user.email, user.full_name)

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
# Onboarding
# -----------------------------
class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        full_name = request.data.get('full_name')
        phone_number = request.data.get('phone_number')

        if not full_name or not phone_number:
            return Response({"detail": "All fields required"}, status=400)

        if not phone_number.startswith('254') or len(phone_number) != 12:
            return Response({"detail": "Invalid phone format"}, status=400)

        user.full_name = full_name.strip()
        user.phone_number = phone_number.strip()
        user.save(update_fields=['full_name', 'phone_number'])

        return Response({"detail": "Profile completed successfully"}, status=200)


# -----------------------------
# Profile / Me
# -----------------------------
class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


# -----------------------------
# Forgot / Reset Password
# -----------------------------
class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=400)
        try:
            user = CustomUser.objects.get(email=email)
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            reset_link = f"{FRONTEND_URL}/reset-password/{uid}/{token}/"
            logger.info(f"Generated password reset link: {reset_link}")

            html_content = f"""
                <p>Hi {user.full_name},</p>
                <p>You requested to reset your password. Click the link below:</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <br>
                <p>If you didn't request this, ignore this email.</p>
                <br>
                <p>Best regards,<br>Team JAY4T</p>
            """
            send_welcome_email(user.email, user.full_name, html_content)

        except CustomUser.DoesNotExist:
            pass  # Do not reveal email existence

        return Response({"detail": "Password reset email sent"}, status=200)


class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get("password")
        if not password:
            return Response({"detail": "Password is required"}, status=400)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                return Response({"detail": "Invalid or expired token"}, status=400)

            user.set_password(password)
            user.save()
            return Response({"detail": "Password reset successful"}, status=200)
        except Exception:
            return Response({"detail": "Invalid request"}, status=400)
