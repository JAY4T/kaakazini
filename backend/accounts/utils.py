from django.core.mail import send_mail
from django.conf import settings
import logging
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

def send_welcome_email(email: str, full_name: str):
    subject = "Welcome to Kaakazini 🎉"
    message = f"Hi {full_name},\n\nWelcome to Kaakazini! Your account has been created successfully."
    html_message = f"""
    <p>Hi {full_name},</p>
    <p>Welcome to <b>Kaakazini</b>! 🎉</p>
    <p>Your account has been created successfully.</p>
    """
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
            html_message=html_message
        )
        logger.info(f"Brevo SMTP email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send Brevo SMTP email to {email}: {e}")


def complete_signup(user):
    """
    Sends welcome email and returns JWT tokens.
    """
    send_welcome_email(user.email, user.full_name or "User")
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
