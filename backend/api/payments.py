import requests
import logging

logger = logging.getLogger(__name__)

# --- IntaSend API credentials ---
INTASEND_API_KEY = 'your_intasend_api_key_here'
INTASEND_BASE_URL = 'https://api.intasend.com/v1/mpesa/stkpush'

def send_stk_push(phone_number: str, amount: float, job_id: int):
    """
    Initiates an MPesa STK Push via IntaSend API.
    
    Args:
        phone_number (str): Craftsman's phone number in international format, e.g., 2547xxxxxxx
        amount (float): Amount to send
        job_id (int): Job ID (for tracking/logging)
    
    Returns:
        tuple: (success: bool, response: dict)
    """
    try:
        # Normalize phone number
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        
        payload = {
            "amount": round(amount, 2),
            "phone_number": phone_number,
            "reference": f"job_{job_id}",
            "description": f"Payment for job {job_id}"
        }

        headers = {
            "Authorization": f"Bearer {INTASEND_API_KEY}",
            "Content-Type": "application/json"
        }

        logger.info(f"STK Push request for Job {job_id}: {payload}")

        response = requests.post(INTASEND_BASE_URL, json=payload, headers=headers, timeout=30)
        response_data = response.json()

        logger.info(f"STK Push response for Job {job_id}: {response_data}")

        if response.status_code == 200 and response_data.get("status") in ["success", "pending"]:
            return True, response_data
        else:
            return False, response_data

    except requests.exceptions.RequestException as e:
        logger.error(f"STK Push request failed for Job {job_id}: {str(e)}")
        return False, {"error": str(e)}

    except Exception as e:
        logger.exception(f"Unexpected error during STK Push for Job {job_id}")
        return False, {"error": str(e)}
