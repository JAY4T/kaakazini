import logging
import requests
from django.conf import settings
 
logger = logging.getLogger(__name__)
 
GATEWAY_DEV  = "https://dev-paymentsms.jay4t.org"
GATEWAY_PROD = "https://paymentsms.jay4t.org"
GATEWAY      = GATEWAY_DEV
 
CHECKOUT_URL    = f"{GATEWAY}/api/v1/intasend/transaction/checkout"
TRANSACTION_URL = f"{GATEWAY}/api/v1/intasend/transaction"
 
HEADERS = {"Content-Type": "application/json", "Accept": "application/json"}
 
# Wallet ID matches walletId: 2 from the Postman collection.
# Change INTASEND_WALLET_ID in .env if the gateway owner gives a new ID.
PLATFORM_WALLET_ID = int(getattr(settings, "INTASEND_WALLET_ID", 2))
 
 
def _phone(number: str) -> str:
    """0712345678 / +254712345678 → 254712345678"""
    p = str(number).replace("+", "").replace(" ", "").strip()
    if p.startswith("07") or p.startswith("01"):
        p = "254" + p[1:]
    return p
 
 
# ─────────────────────────────────────────────────────────────────────────────
# 1. STK PUSH — send M-Pesa prompt to client's phone
#    POST /api/v1/intasend/transaction/checkout
#    Money goes to PLATFORM_WALLET_ID (wallet 2)
# ─────────────────────────────────────────────────────────────────────────────
 
def initiate_stk_push(
    phone_number: str,
    amount: float,
    job_id: int,
    narrative: str = "",
) -> dict:
    """
    Sends STK push to client's phone.
    After success, poll check_payment_status() every 3s until COMPLETE or FAILED.
 
    Returns:
      {"success": True,  "transaction_id": "abc123"}
      {"success": False, "error": "..."}
    """
    phone  = _phone(phone_number)
    amount = int(round(float(amount)))
 
    if amount < 1:
        return {"success": False, "error": "Amount must be at least KES 1."}
 
    payload = {
        "amount":      amount,
        "currency":    "KES",
        "method":      "M-PESA",
        "phoneNumber": phone,
        "walletId":    PLATFORM_WALLET_ID,
        "narration":   narrative or f"KaaKazini Job #{job_id}",
    }
 
    logger.info(f"[STK] Job #{job_id} | {phone} | KES {amount} | wallet #{PLATFORM_WALLET_ID}")
    try:
        resp = requests.post(CHECKOUT_URL, json=payload, headers=HEADERS, timeout=30)
        logger.info(f"[STK] {resp.status_code}: {resp.text[:400]}")
 
        try:
            data = resp.json()
        except Exception:
            return {"success": False, "error": f"Non-JSON ({resp.status_code}): {resp.text[:200]}"}
 
        if resp.status_code in (200, 201, 202):
            # Extract transaction ID — try every possible location in the response.
            # IMPORTANT: use .get() with no default so missing keys return None,
            # then filter out None and empty string before joining with 'or'.
            d = data.get("data") or {}
            transaction_id = (
                data.get("id")
                or data.get("transaction_id")
                or data.get("transactionId")
                or data.get("invoice_id")
                or d.get("id")
                or d.get("transaction_id")
                or d.get("transactionId")
                or d.get("invoice_id")
                or ""
            )
            transaction_id = str(transaction_id) if transaction_id else ""
            logger.info(f"[STK] OK Job #{job_id} | tx={transaction_id} | full response={data}")
            return {"success": True, "transaction_id": transaction_id, "raw": data}
 
        err = data.get("message") or data.get("detail") or data.get("error") or str(data)
        logger.warning(f"[STK] Failed {resp.status_code}: {err}")
        return {"success": False, "error": str(err), "raw": data}
 
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Gateway timed out. Try again."}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Cannot reach payment gateway."}
    except Exception as exc:
        logger.error(f"[STK] Error Job #{job_id}: {exc}", exc_info=True)
        return {"success": False, "error": str(exc)}
 
 
# ─────────────────────────────────────────────────────────────────────────────
# 2. POLL STATUS — call every 3s after STK push
#    GET /api/v1/intasend/transaction/:id
# ─────────────────────────────────────────────────────────────────────────────
 
def check_payment_status(transaction_id: str) -> dict:
    """
    Returns:
      {"success": True, "status": "COMPLETE"}  → mark job Paid
      {"success": True, "status": "FAILED"}    → let client retry
      {"success": True, "status": "PENDING"}   → keep polling
      {"success": False, "error": "..."}       → network error, keep polling
    """
    url = f"{TRANSACTION_URL}/{transaction_id}"
    logger.debug(f"[Poll] GET {url}")
 
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        logger.info(f"[Poll] tx={transaction_id} → {resp.status_code}: {resp.text[:200]}")
 
        try:
            data = resp.json()
        except Exception:
            return {"success": False, "error": "Non-JSON response from gateway"}
 
        if resp.status_code == 200:
            d = data.get("data") or {}
            raw_status = (
                data.get("status")
                or data.get("state")
                or d.get("status")
                or d.get("state")
                or "PENDING"
            )
            return {"success": True, "status": str(raw_status).upper(), "raw": data}
 
        return {"success": False, "error": str(data)}
 
    except Exception as exc:
        logger.error(f"[Poll] Error tx={transaction_id}: {exc}")
        return {"success": False, "error": str(exc)}