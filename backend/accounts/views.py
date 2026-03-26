import os
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from backend import settings
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import requests as http_requests  # plain requests, not google's

from .models import CustomUser
from .serializers import (
    CraftsmanSignupSerializer,
    ClientSignupSerializer,
    RoleLoginSerializer,
    UserProfileSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)
User = get_user_model()

# ── Read from Django settings (loaded by decouple), NOT os.environ ──────────
GOOGLE_CLIENT_ID   = getattr(settings, "GOOGLE_CLIENT_ID",   None)
FRONTEND_URL       = getattr(settings, "FRONTEND_URL",       "http://localhost:3000")
BREVO_API_KEY      = getattr(settings, "BREVO_API_KEY",      "")
BREVO_SENDER_EMAIL = getattr(settings, "BREVO_SENDER_EMAIL", "noreply@kaakazini.com")

# Role → frontend dashboard path
ROLE_DASHBOARD = {
    "craftsman": "/craftsman/dashboard",
    "client":    "/client/dashboard",
    "admin":     "/admin/dashboard",
}


# ─────────────────────────────────────────────
# Brevo email (plain HTTP — no SDK needed)
# ─────────────────────────────────────────────

def send_email(to_email: str, to_name: str, subject: str, html_content: str) -> bool:
    """
    Send a transactional email via the Brevo REST API.
    Returns True on success, False on any failure.
    """
    if not BREVO_API_KEY:
        logger.warning("BREVO_API_KEY is not set — skipping email to %s", to_email)
        return False

    payload = {
        "sender":      {"name": BREVO_SENDER_EMAIL, "email": BREVO_SENDER_EMAIL},
        "replyTo":     {"name": BREVO_SENDER_EMAIL, "email": "support@kaakazini.com"},
        "to":          [{"email": to_email, "name": to_name or "User"}],
        "subject":     subject,
        "htmlContent": html_content,
    }

    try:
        resp = http_requests.post(
            "https://api.brevo.com/v3/smtp/email",
            json=payload,
            headers={
                "api-key":      BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept":       "application/json",
            },
            timeout=10,
        )
        resp.raise_for_status()
        logger.info("Brevo email sent to %s (status %s)", to_email, resp.status_code)
        return True
    except http_requests.exceptions.HTTPError as exc:
        logger.error(
            "Brevo HTTP error for %s: %s — body: %s",
            to_email, exc, exc.response.text if exc.response else "—",
        )
    except Exception as exc:
        logger.error("Brevo send failed for %s: %s", to_email, exc)
    return False


def send_welcome_email(email: str, full_name: str, role: str = "") -> bool:
    name = full_name or "User"
    role_label = role.capitalize() if role else "Member"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#FFD700;margin:0;">Welcome to KaaKazini!</h2>
      </div>
      <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
        <p style="font-size:1rem;color:#111827;">Hi <strong>{name}</strong>,</p>
        <p style="color:#374151;">
          Your <strong>{role_label}</strong> account has been created successfully.
          You can now log in and start using KaaKazini.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{FRONTEND_URL}/login"
             style="background:#FFD700;color:#0d0d0d;padding:14px 32px;
                    border-radius:10px;text-decoration:none;font-weight:700;
                    font-size:1rem;display:inline-block;">
            Log In &rarr;
          </a>
        </div>
      </div>
      <div style="background:#f3f4f6;padding:14px 32px;border-radius:0 0 12px 12px;
                  font-size:.75rem;color:#9ca3af;text-align:center;">
        KaaKazini &mdash; Kenya's verified craftsman marketplace
      </div>
    </div>
    """
    return send_email(email, name, "Welcome to KaaKazini!", html)


# ─────────────────────────────────────────────
# Auth helpers
# ─────────────────────────────────────────────

def set_auth_cookies(response, user, remember=False):
    refresh = RefreshToken.for_user(user)
    access_max_age  = 7 * 24 * 3600 if remember else 30 * 60
    refresh_max_age = 7 * 24 * 3600 if remember else 24 * 3600

    for name, value, max_age in [
        ("access_token",  str(refresh.access_token), access_max_age),
        ("refresh_token", str(refresh),               refresh_max_age),
    ]:
        response.set_cookie(
            name, value,
            httponly=True,
            secure=False,      # set True in production (HTTPS)
            samesite="Lax",
            max_age=max_age,
            path="/",
        )
    return response


def _user_payload(user):
    """Consistent user payload + dashboard redirect for every login response."""
    return {
        "id":         user.id,
        "email":      user.email,
        "full_name":  user.full_name,
        "role":       user.role,
        "dashboard":  ROLE_DASHBOARD.get(user.role, "/dashboard"),
    }


# ─────────────────────────────────────────────
# Signup
# ─────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """Craftsman signup — POST /api/signup/"""
    serializer_class = CraftsmanSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user.email, user.full_name, role="craftsman")


class ClientSignupView(generics.CreateAPIView):
    """Client signup — POST /api/client-signup/"""
    serializer_class = ClientSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user.email, user.full_name, role="client")


# ─────────────────────────────────────────────
# Login  (each endpoint enforces its own role)
# ─────────────────────────────────────────────

class LoginAPIView(APIView):
    """Craftsman login — POST /api/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RoleLoginSerializer(
            data={**request.data, "role": "craftsman"}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.context["user"]
        remember = request.data.get("remember", False)
        response = Response({"detail": "Login successful", "user": _user_payload(user)})
        return set_auth_cookies(response, user, remember=remember)


class ClientLoginView(APIView):
    """Client login — POST /api/client-login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RoleLoginSerializer(
            data={**request.data, "role": "client"}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.context["user"]
        remember = request.data.get("remember", False)
        response = Response({"detail": "Login successful", "user": _user_payload(user)})
        return set_auth_cookies(response, user, remember=remember)


class AdminLoginAPIView(APIView):
    """Admin login — POST /api/admin-login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RoleLoginSerializer(
            data={**request.data, "role": "admin"}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.context["user"]

        # Backfill role field for legacy staff accounts
        if user.is_staff and user.role != "admin":
            user.role = "admin"
            user.save(update_fields=["role"])

        response = Response({"detail": "Admin login successful", "user": _user_payload(user)})
        return set_auth_cookies(response, user)


# ─────────────────────────────────────────────
# Google OAuth
# ─────────────────────────────────────────────

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        role  = request.data.get("role")

        if not token:
            return Response({"detail": "No token provided"}, status=400)
        if role not in ("craftsman", "client"):
            return Response({"detail": "Invalid role. Must be 'craftsman' or 'client'."}, status=400)

        try:
            idinfo    = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            email     = idinfo["email"]
            full_name = idinfo.get("name", "")

            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={"full_name": full_name, "role": role},
            )

            if not created and user.role != role:
                return Response(
                    {"detail": f"This Google account is registered as '{user.role}'. "
                               f"Please use the {user.role} login page."},
                    status=403,
                )

            if created:
                send_welcome_email(email, full_name, role=role)

            response = Response({
                "detail":  "Google login successful",
                "user":    _user_payload(user),
                "created": created,
            })
            return set_auth_cookies(response, user)

        except Exception as exc:
            logger.error("Google login failed: %s", exc)
            return Response({"detail": "Invalid Google token"}, status=400)


# ─────────────────────────────────────────────
# Logout
# ─────────────────────────────────────────────

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Logged out successfully"})
        response.delete_cookie("access_token",  path="/")
        response.delete_cookie("refresh_token", path="/")
        return response


# ─────────────────────────────────────────────
# Onboarding
# ─────────────────────────────────────────────

class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        full_name    = request.data.get("full_name", "").strip()
        phone_number = request.data.get("phone_number", "").strip()

        if not full_name or not phone_number:
            return Response({"detail": "full_name and phone_number are required."}, status=400)
        if not phone_number.startswith("254") or len(phone_number) != 12:
            return Response({"detail": "Phone must start with 254 and be 12 digits."}, status=400)

        user.full_name    = full_name
        user.phone_number = phone_number
        user.save(update_fields=["full_name", "phone_number"])
        return Response({"detail": "Profile updated successfully."}, status=200)


# ─────────────────────────────────────────────
# Profile / Me
# ─────────────────────────────────────────────

class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


# ─────────────────────────────────────────────
# Forgot / Reset Password
# ─────────────────────────────────────────────

class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"detail": "Email is required."}, status=400)

        try:
            user      = CustomUser.objects.get(email=email)
            generator = PasswordResetTokenGenerator()
            token     = generator.make_token(user)
            uid       = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{FRONTEND_URL}/reset-password/{uid}/{token}/"

            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
              <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
                <h2 style="color:#FFD700;margin:0;">Reset your password</h2>
              </div>
              <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
                <p style="color:#374151;">Hi <strong>{user.full_name or 'there'}</strong>,</p>
                <p style="color:#374151;">Click the button below to reset your password.
                   This link expires in 1 hour.</p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="{reset_url}"
                     style="background:#FFD700;color:#0d0d0d;padding:14px 32px;
                            border-radius:10px;text-decoration:none;font-weight:700;
                            font-size:1rem;display:inline-block;">
                    Reset Password &rarr;
                  </a>
                </div>
                <p style="font-size:.85rem;color:#9ca3af;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            </div>
            """
            send_email(user.email, user.full_name or "", "Reset your KaaKazini password", html)

        except CustomUser.DoesNotExist:
            pass  # Never reveal whether the email exists

        return Response({"detail": "If that email is registered, a reset link has been sent."}, status=200)


class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get("password", "")
        if not password or len(password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=400)
        try:
            uid  = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({"detail": "Invalid or expired token."}, status=400)
            user.set_password(password)
            user.save()
            return Response({"detail": "Password reset successful."}, status=200)
        except Exception:
            return Response({"detail": "Invalid request."}, status=400)