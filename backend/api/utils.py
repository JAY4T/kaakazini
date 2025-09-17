# api/utils.py
import logging
from django.conf import settings
from sib_api_v3_sdk import ApiClient, Configuration
from sib_api_v3_sdk.api import transactional_emails_api
from sib_api_v3_sdk.models import SendSmtpEmail

logger = logging.getLogger(__name__)

def send_craftsman_approval_email(email: str, full_name: str):
    """
    Send an approval email via Brevo API when a craftsman is approved.
    """
    api_key = getattr(settings, "BREVO_API_KEY", None)
    if not api_key:
        logger.error("BREVO_API_KEY not set in settings")
        return

    configuration = Configuration()
    configuration.api_key["api-key"] = api_key
    api_instance = transactional_emails_api.TransactionalEmailsApi(ApiClient(configuration))

    email_content = SendSmtpEmail(
        sender={"name": "Kaakazini Team", "email": "noreply@kaakazini.com"},
        reply_to={"name": "Kaakazini Team", "email": "support@kaakazini.com"},
        to=[{"email": email, "name": full_name or "User"}],  # <- fallback to "User"
        subject="Your Craftsman Profile Has Been Approved",
        html_content=f"""
        <p>Hi {full_name or 'User'},</p>
        <p>Good news! Your profile on <b>Kaakazini</b> has been approved by the admin.</p>
        <p>You can now access all features.</p>
        <br>
        <p>— The Kaakazini Team</p>
        """
    )

    try:
        api_instance.send_transac_email(email_content)
        logger.info(f"Approval email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send approval email to {email}: {e}")
