import logging
from django.conf import settings
from sib_api_v3_sdk import ApiClient, Configuration
from sib_api_v3_sdk.api import transactional_emails_api
from sib_api_v3_sdk.models import SendSmtpEmail
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


def send_welcome_email(email: str, full_name: str):
    """
    Send a welcome email via Brevo API.
    """
    api_key = getattr(settings, "BREVO_API_KEY", None)
    if not api_key:
        logger.error("BREVO_API_KEY not set in settings")
        return

    configuration = Configuration()
    configuration.api_key["api-key"] = api_key
    api_instance = transactional_emails_api.TransactionalEmailsApi(ApiClient(configuration))

    email_content = SendSmtpEmail(
        sender={"name": "KaaKazini", "email": "kaakazini.jay4t@gmail.com"},
        to=[{"email": email, "name": full_name or "User"}],
        subject="Welcome to Kaakazini !!",
        html_content=f"""
            <p>Hi {full_name or 'User'},</p>
            <p>Welcome to <b>Kaakazini</b>! !!</p>
            <p>Your account has been created successfully.</p>
        """,
    )

    try:
        api_instance.send_transac_email(email_content)
        logger.info(f"Brevo API email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send Brevo API email to {email}: {e}")


def complete_signup(user):
    """
    Sends welcome email via Brevo API and returns JWT tokens.
    """
    send_welcome_email(user.email, user.full_name)

    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
