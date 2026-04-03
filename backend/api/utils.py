import logging
from django.conf import settings
from sib_api_v3_sdk import ApiClient, Configuration
from sib_api_v3_sdk.api import transactional_emails_api
from sib_api_v3_sdk.models import SendSmtpEmail
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

ROLE_LABELS = {
    'moderator':   'Moderator',
    'maintenance': 'Maintenance',
    'support':     'Support Agent',
    'finance':     'Finance Officer',
    'analytics':   'Analytics Analyst',
}


# ─────────────────────────────────────────────────────────────────
# CORE — single Brevo sender everything else calls
# ─────────────────────────────────────────────────────────────────

def _get_api_instance():
    api_key = getattr(settings, 'BREVO_API_KEY', None)
    if not api_key:
        logger.error('BREVO_API_KEY not set in settings')
        return None
    configuration = Configuration()
    configuration.api_key['api-key'] = api_key
    return transactional_emails_api.TransactionalEmailsApi(ApiClient(configuration))


def _require_setting(name: str) -> str:
    """
    Fetch a required Django setting and raise clearly if it is missing.
    This prevents silent broken links in staging / production.
    """
    value = getattr(settings, name, None)
    if not value:
        raise ImproperlyConfigured(
            f"'{name}' must be set in Django settings. "
            "Add it to your .env / settings file before sending emails."
        )
    return value


def send_email(to_email: str, subject: str, html_content: str, to_name: str = 'User'):
    """
    Core sender — every other function calls this.
    """
    api_instance = _get_api_instance()
    if not api_instance:
        return

    email_content = SendSmtpEmail(
        sender       = {'name': 'KaaKazini', 'email': 'noreply@kaakazini.com'},
        reply_to     = {'name': 'KaaKazini', 'email': 'support@kaakazini.com'},
        to           = [{'email': to_email, 'name': to_name}],
        subject      = subject,
        html_content = html_content,
    )

    try:
        api_instance.send_transac_email(email_content)
        logger.info("Brevo email sent to %s — subject: '%s'", to_email, subject)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)


# ─────────────────────────────────────────────────────────────────
# WELCOME — new craftsman / client signup
# ─────────────────────────────────────────────────────────────────

def send_welcome_email(email: str, full_name: str, role: str = ''):
    name       = full_name or 'User'
    role_label = role.capitalize() if role else 'Member'
    frontend   = _require_setting('FRONTEND_URL')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#FFD700;margin:0;">Welcome to KaaKazini!</h2>
      </div>
      <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
        <p style="color:#111827;">Hi <strong>{name}</strong>,</p>
        <p style="color:#374151;">
          Your <strong>{role_label}</strong> account has been created successfully.
          You can now log in and start using KaaKazini.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{frontend}/login"
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
    send_email(email, 'Welcome to KaaKazini!', html, to_name=name)


# ─────────────────────────────────────────────────────────────────
# CRAFTSMAN APPROVAL
# ─────────────────────────────────────────────────────────────────

def send_craftsman_approval_email(email: str, full_name: str):
    name     = full_name or 'User'
    frontend = _require_setting('FRONTEND_URL')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#FFD700;margin:0;">Profile Approved!</h2>
      </div>
      <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
        <p style="color:#111827;">Hi <strong>{name}</strong>,</p>
        <p style="color:#374151;">
          Great news! Your craftsman profile on <strong>KaaKazini</strong>
          has been reviewed and <strong style="color:#16a34a;">approved</strong>.
          You can now receive job requests from clients.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{frontend}/craftsman/dashboard"
             style="background:#FFD700;color:#0d0d0d;padding:14px 32px;
                    border-radius:10px;text-decoration:none;font-weight:700;
                    font-size:1rem;display:inline-block;">
            Go to Dashboard &rarr;
          </a>
        </div>
      </div>
      <div style="background:#f3f4f6;padding:14px 32px;border-radius:0 0 12px 12px;
                  font-size:.75rem;color:#9ca3af;text-align:center;">
        KaaKazini &mdash; Kenya's verified craftsman marketplace
      </div>
    </div>
    """
    send_email(email, 'Your KaaKazini Profile Has Been Approved', html, to_name=name)


# ─────────────────────────────────────────────────────────────────
# STAFF WELCOME — admin creates a staff member
# ─────────────────────────────────────────────────────────────────

def send_staff_welcome_email(name: str, email: str, password: str, role: str):
    role_label    = ROLE_LABELS.get(role, role.title())
    dashboard_url = _require_setting('ADMIN_DASHBOARD_URL')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#FFD700;margin:0;">Welcome to KaaKazini Admin</h2>
      </div>
      <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
        <p style="color:#111827;">Hi <strong>{name}</strong>,</p>
        <p style="color:#374151;">
          Your staff account has been created. Here are your login credentials:
        </p>

        <div style="background:#fff;border:1px solid #e5e7eb;
                    border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#374151;">
            <strong>Role:</strong> {role_label}
          </p>
          <p style="margin:0 0 8px;color:#374151;">
            <strong>Email:</strong> {email}
          </p>
          <p style="margin:0;color:#374151;">
            <strong>Temporary Password:</strong>
            <code style="background:#f3f4f6;padding:3px 8px;
                         border-radius:4px;">{password}</code>
          </p>
        </div>

        <div style="text-align:center;margin:28px 0;">
          <a href="{dashboard_url}"
             style="background:#FFD700;color:#0d0d0d;padding:14px 32px;
                    border-radius:10px;text-decoration:none;font-weight:700;
                    font-size:1rem;display:inline-block;">
            Log In to Dashboard &rarr;
          </a>
        </div>

        <p style="font-size:.85rem;color:#9ca3af;">
          Please change your password after your first login.
          Do not share these credentials with anyone.
        </p>
      </div>
      <div style="background:#f3f4f6;padding:14px 32px;border-radius:0 0 12px 12px;
                  font-size:.75rem;color:#9ca3af;text-align:center;">
        KaaKazini &mdash; Kenya's verified craftsman marketplace
      </div>
    </div>
    """
    send_email(email, f'Your KaaKazini Staff Account — {role_label}', html, to_name=name)


# ─────────────────────────────────────────────────────────────────
# SIGNUP HELPER — used by signup views
# ─────────────────────────────────────────────────────────────────

def complete_signup(user):
    """Sends welcome email and returns JWT tokens."""
    send_welcome_email(user.email, user.full_name)
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }