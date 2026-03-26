import logging
import requests
from django.conf import settings
 
logger = logging.getLogger(__name__)
 
FRONTEND_URL  = getattr(settings, "FRONTEND_URL",        "https://kaakazini.com")
SENDER_EMAIL  = getattr(settings, "BREVO_SENDER_EMAIL",  "noreply@kaakazini.com")
SENDER_NAME   = getattr(settings, "BREVO_SENDER_NAME",   "KaaKazini")
CELCOM_SENDER = getattr(settings, "CELCOM_SENDER_ID",    "KaaKazini")
 
 
def _invite_link(token):
    return f"{FRONTEND_URL}/join/{token}/"
 
 
# ─────────────────────────────────────────────
# Brevo — transactional email
# ─────────────────────────────────────────────
 
def send_invite_email(invite):
    """
    Send a team invite via Brevo transactional email API.
    invite: TeamInvite instance (contact = email address)
    """
    api_key = getattr(settings, "BREVO_API_KEY", "")
    if not api_key:
        logger.warning("[Brevo] BREVO_API_KEY not set — skipping email invite.")
        return False
 
    to_email = invite.contact
    to_name  = invite.name or "there"
    role     = invite.role.capitalize()
    craftsman_name = (
        invite.craftsman.full_name
        or invite.craftsman.user.full_name
        or "A craftsman"
    )
    link = _invite_link(invite.token)
 
    html_content = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#0d0d0d;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#FFD700;margin:0;font-size:1.4rem;">
          &#128295; You've been invited to join a team on KaaKazini
        </h2>
      </div>
      <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;">
        <p style="font-size:1rem;color:#111827;">Hi <strong>{to_name}</strong>,</p>
        <p style="color:#374151;">
          <strong>{craftsman_name}</strong> would like you to join their team on
          <strong>KaaKazini</strong> as a <strong>{role}</strong>.
        </p>
        <p style="color:#374151;">
          Click the button below to accept the invite. Once you do,
          <strong>{craftsman_name}</strong> will approve your request and you'll
          be added to the team.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{link}"
             style="background:#FFD700;color:#0d0d0d;padding:14px 32px;
                    border-radius:10px;text-decoration:none;font-weight:700;
                    font-size:1rem;display:inline-block;">
            Accept Invite &rarr;
          </a>
        </div>
        <p style="font-size:.8rem;color:#9ca3af;word-break:break-all;">
          Or copy this link: {link}
        </p>
      </div>
      <div style="background:#f3f4f6;padding:14px 32px;border-radius:0 0 12px 12px;
                  font-size:.75rem;color:#9ca3af;text-align:center;">
        KaaKazini &mdash; Kenya's verified craftsman marketplace
      </div>
    </div>
    """
 
    payload = {
        "sender":   {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "to":       [{"email": to_email, "name": to_name}],
        "subject":  f"You're invited to join {craftsman_name}'s team on KaaKazini",
        "htmlContent": html_content,
    }
 
    try:
        resp = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            json=payload,
            headers={
                "api-key":      api_key,
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        resp.raise_for_status()
        logger.info(f"[Brevo] Invite email sent to {to_email} (invite #{invite.id})")
        return True
    except requests.RequestException as exc:
        logger.error(f"[Brevo] Failed to send invite email to {to_email}: {exc}")
        return False
 
 
# ─────────────────────────────────────────────
# Celcom Africa — SMS
# ─────────────────────────────────────────────
 
def send_invite_sms(invite):
    """
    Send a team invite via Celcom Africa SMS API.
    invite: TeamInvite instance (contact = phone number, e.g. 2547XXXXXXXX)
    Celcom docs: https://developers.celcomafrica.com/
    """
    api_key = getattr(settings, "CELCOM_API_KEY", "")
    if not api_key:
        logger.warning("[Celcom] CELCOM_API_KEY not set — skipping SMS invite.")
        return False
 
    phone = invite.contact
    role  = invite.role.capitalize()
    craftsman_name = (
        invite.craftsman.full_name
        or invite.craftsman.user.full_name
        or "A craftsman"
    )
    link = _invite_link(invite.token)
 
    message = (
        f"Hi {invite.name or 'there'}! {craftsman_name} wants you to join "
        f"their KaaKazini team as {role}. Accept here: {link}"
    )
 
    payload = {
        "api_key":   api_key,
        "sender_id": CELCOM_SENDER,
        "message":   message,
        "phone":     phone,
    }
 
    try:
        resp = requests.post(
            "https://quicksms.celcomafrica.com/api/send_sms",
            json=payload,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
 
        # Celcom returns {"success": true/false, ...}
        if data.get("success") or data.get("status") == "success":
            logger.info(f"[Celcom] SMS sent to {phone} (invite #{invite.id})")
            return True
        else:
            logger.error(f"[Celcom] SMS failed for {phone}: {data}")
            return False
 
    except requests.RequestException as exc:
        logger.error(f"[Celcom] Request error sending SMS to {phone}: {exc}")
        return False
 
 
# ─────────────────────────────────────────────
# WhatsApp via Celcom
# ─────────────────────────────────────────────
 
def send_invite_whatsapp(invite):
    """
    Send a WhatsApp message via Celcom Africa WhatsApp Business API.
    Falls back to SMS if WhatsApp endpoint fails.
    """
    api_key = getattr(settings, "CELCOM_API_KEY", "")
    if not api_key:
        logger.warning("[Celcom] CELCOM_API_KEY not set — skipping WhatsApp invite.")
        return False
 
    phone = invite.contact
    role  = invite.role.capitalize()
    craftsman_name = (
        invite.craftsman.full_name
        or invite.craftsman.user.full_name
        or "A craftsman"
    )
    link = _invite_link(invite.token)
 
    message = (
        f"Hi {invite.name or 'there'}! \n\n"
        f"*{craftsman_name}* would like you to join their team on *KaaKazini* "
        f"as a *{role}*.\n\n"
        f"Click the link to accept — they'll approve you right away:\n{link}"
    )
 
    payload = {
        "api_key":   api_key,
        "sender_id": CELCOM_SENDER,
        "message":   message,
        "phone":     phone,
    }
 
    try:
        resp = requests.post(
            "https://quicksms.celcomafrica.com/api/whatsapp",
            json=payload,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
 
        if data.get("success") or data.get("status") == "success":
            logger.info(f"[Celcom] WhatsApp sent to {phone} (invite #{invite.id})")
            return True
        else:
            logger.warning(f"[Celcom] WhatsApp failed for {phone}, falling back to SMS: {data}")
            return send_invite_sms(invite)
 
    except requests.RequestException as exc:
        logger.warning(f"[Celcom] WhatsApp request error for {phone}, falling back to SMS: {exc}")
        return send_invite_sms(invite)
 
 
# ─────────────────────────────────────────────
# Dispatcher — called from views.py
# ─────────────────────────────────────────────
 
def dispatch_invite_notification(invite):
    """
    Route the notification to the correct channel based on invite.method.
    Returns True if notification was sent successfully, False otherwise.
    """
    method = invite.method
 
    if method == "email":
        return send_invite_email(invite)
 
    elif method == "sms":
        return send_invite_sms(invite)
 
    elif method == "whatsapp":
        return send_invite_whatsapp(invite)
 
    elif method == "link":
        # Link method — no notification sent, user copies/shares manually
        return True
 
    else:
        logger.warning(f"[Invite] Unknown method '{method}' for invite #{invite.id}")
        return False
 