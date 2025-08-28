# accounts/signals.py
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
import logging

logger = logging.getLogger(__name__)

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Called when django-rest-passwordreset creates a token.
    We send a Brevo transactional email containing a reset link that contains the token.
    """
    user = reset_password_token.user
    # Build reset link that frontend will consume (frontend reads ?token=)
    reset_link = f"{settings.FRONTEND_RESET_URL}?token={reset_password_token.key}"

    # Prepare Brevo email
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY
    api_client = sib_api_v3_sdk.ApiClient(configuration)
    email_api = sib_api_v3_sdk.TransactionalEmailsApi(api_client)

    subject = "Reset your Kaakazini password"
    html_content = f"""
      <p>Hi {user.get_username()},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <p><a href="{reset_link}" style="display:inline-block;padding:10px 16px;
           background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px;">
           Reset your password
      </a></p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    """

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": user.email}],
        sender={"email": settings.BREVO_SENDER_EMAIL, "name": settings.BREVO_SENDER_NAME},
        subject=subject,
        html_content=html_content
    )

    try:
        result = email_api.send_transac_email(email)
        logger.info("Sent password reset email to %s via Brevo: %s", user.email, getattr(result, 'messageId', None))
    except ApiException as e:
        # Log and continue — do NOT throw; token was still created
        logger.error("Brevo email failed for %s: %s", user.email, str(e))
