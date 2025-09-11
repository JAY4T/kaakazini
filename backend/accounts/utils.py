# accounts/utils.py
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

logger = logging.getLogger(__name__)

def send_welcome_email(email: str, full_name: str):
    """
    Send a welcome email via Brevo (Sendinblue).
    """
    try:
        # Configure API key
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.BREVO_API_KEY

        # Create transactional email API instance
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

        sender_email = settings.BREVO_SENDER_EMAIL
        sender_name = getattr(settings, "BREVO_SENDER_NAME", "Kaakazini")

        # Create the email object
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email, "name": full_name}],
            sender={"email": sender_email, "name": sender_name},
            subject="Welcome to Kaakazini!",
            html_content=f"""
                <p>Hi {full_name},</p>
                <p>Welcome to Kaakazini! You are now registered as a craftsman.</p>
                <p>We are excited to have you on board!</p>
            """
        )

        # Send email
        response = api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Brevo email sent to {email}: {response}")
        return response

    except ApiException as e:
        logger.error(f"Brevo API exception for {email}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error sending email to {email}: {e}")
        return None


def complete_signup(user):
    """
    Sends welcome email and returns JWT tokens.
    """
    # DEBUG: log the user
    logger.info(f"Completing signup for user: {user.email}")

    # Send welcome email
    result = send_welcome_email(user.email, user.full_name)
    if not result:
        logger.warning(f"Email was not sent to {user.email}")

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
