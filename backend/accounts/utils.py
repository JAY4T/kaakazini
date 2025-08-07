import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_sms(phone, message):
    url = 'https://ujumbesms.co.ke/api/messaging'

    headers = {
        'Content-Type': 'application/json',
        'X-Authorization': settings.UJUMBE_API_KEY,
        'email': settings.UJUMBE_EMAIL,
    }

    payload = {
        "data": [
            {
                "message_bag": {
                    "numbers": phone,  # send as string not list
                    "message": message,
                    "sender": settings.UJUMBE_SENDER_ID
                }
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        logger.info("Ujumbe API response status code: %s", response.status_code)
        logger.info("Ujumbe API response: %s", response.text)

        response.raise_for_status()

        resp_json = response.json()
        code = resp_json.get("status", {}).get("code")

        if code not in ("1000", "1008"):  # success or queued
            logger.error("SMS sending failed: %s", resp_json)
            raise ValueError(f"SMS failed: {resp_json.get('status', {}).get('description')}")
    except Exception as e:
        logger.error(f"Exception during SMS send: {e}")
