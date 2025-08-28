import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_sms(phone, message):
    url = 'https://ujumbesms.co.ke/api/messaging'  # Use https:// if supported

    headers = {
        'Content-Type': 'application/json',
        'X-Authorization': settings.UJUMBE_API_KEY,  # from .env or settings
        'email': settings.UJUMBE_EMAIL
    }

    payload = {
        "data": [
            {
                "message_bag": {
                    "numbers": phone,
                    "message": message,
                    "sender": "UJUMBESMS"  # Or your registered sender ID
                }
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        logger.info(f"SMS sent to {phone}: {response.json()}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send SMS to {phone}: {e}")
        raise
