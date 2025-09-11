from sib_api_v3_sdk import ApiClient, Configuration
from sib_api_v3_sdk.api import transactional_emails_api
from sib_api_v3_sdk.models import SendSmtpEmail
import os, logging

logger = logging.getLogger(__name__)

def send_welcome_email(email: str, full_name: str):
    api_key = os.getenv("BREVO_API_KEY")  # or use settings.BREVO_API_KEY
    if not api_key:
        logger.error("BREVO_API_KEY not set")
        return

    configuration = Configuration()
    configuration.api_key['api-key'] = api_key
    api_instance = transactional_emails_api.TransactionalEmailsApi(ApiClient(configuration))

    email_content = SendSmtpEmail(
        sender={"name": "Kaakazini", "email": "noreply@kaakazini.com"},
        to=[{"email": email, "name": full_name or "User"}],
        subject="Welcome to Kaakazini 🎉",
        html_content=f"<p>Hi {full_name or 'User'},</p><p>Welcome to Kaakazini! 🎉</p>"
    )

    try:
        api_instance.send_transac_email(email_content)
        logger.info(f"Brevo API email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send Brevo API email to {email}: {e}")
