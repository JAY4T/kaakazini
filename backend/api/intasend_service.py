import logging
import requests

logger = logging.getLogger(__name__)

GATEWAY_DEV  = "https://dev-paymentsms.jay4t.org"
GATEWAY_PROD = "https://paymentsms.jay4t.org"
GATEWAY      = GATEWAY_DEV   # ← change to GATEWAY_PROD when going live

WALLET_URL      = f"{GATEWAY}/api/v1/intasend/wallet"
CHECKOUT_URL    = f"{GATEWAY}/api/v1/intasend/transaction/checkout"
TRANSACTION_URL = f"{GATEWAY}/api/v1/intasend/transaction"

HEADERS = {"Content-Type": "application/json", "Accept": "application/json"}

# Fallback only — used if craftsman has no wallet_id yet
PLATFORM_WALLET_FALLBACK = 2


def _phone(number: str) -> str:
    """0712345678 / +254712345678 → 254712345678"""
    p = str(number).replace("+", "").replace(" ", "").strip()
    if p.startswith("07") or p.startswith("01"):
        p = "254" + p[1:]
    return p


# ─────────────────────────────────────────────────────────────────────────────
# 1. CREATE WALLET
# ─────────────────────────────────────────────────────────────────────────────

def create_craftsman_wallet(craftsman_name: str, craftsman_id: int) -> dict:
    payload = {
        "name":           craftsman_name,
        "description":    f"KaaKazini wallet for craftsman #{craftsman_id}",
        "isSystemWallet": False,
    }
    logger.info(f"[Wallet] Creating for craftsman #{craftsman_id} '{craftsman_name}'")
    try:
        resp = requests.post(WALLET_URL, json=payload, headers=HEADERS, timeout=20)
        logger.info(f"[Wallet] {resp.status_code}: {resp.text[:300]}")
        try:
            data = resp.json()
        except Exception:
            return {"success": False, "error": f"Non-JSON {resp.status_code}: {resp.text[:200]}"}

        if resp.status_code in (200, 201):
            d = data.get("data") or {}
            wallet_id = d.get("id")
            if wallet_id:
                logger.info(f"[Wallet] Created id={wallet_id} for craftsman #{craftsman_id}")
                return {"success": True, "wallet_id": int(wallet_id)}
            return {"success": False, "error": "Wallet response missing id field", "raw": data}

        err = data.get("message") or data.get("detail") or data.get("error") or str(data)
        return {"success": False, "error": str(err)}

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Gateway timed out creating wallet."}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Cannot reach payment gateway."}
    except Exception as exc:
        logger.error(f"[Wallet] Error craftsman #{craftsman_id}: {exc}", exc_info=True)
        return {"success": False, "error": str(exc)}


# ─────────────────────────────────────────────────────────────────────────────
# 2. STK PUSH
# ─────────────────────────────────────────────────────────────────────────────

def initiate_stk_push(
    phone_number: str,
    amount: float,
    job_id: int,
    wallet_id: int,
    narrative: str = "",
) -> dict:
    phone  = _phone(phone_number)
    amount = int(round(float(amount)))

    if amount < 1:
        return {"success": False, "error": "Amount must be at least KES 1."}
    if not wallet_id:
        return {"success": False, "error": "Craftsman wallet not set up. Contact support."}

    payload = {
        "amount":      amount,
        "currency":    "KES",
        "method":      "M-PESA",
        "phoneNumber": phone,
        "walletId":    wallet_id,
        "narration":   narrative or f"KaaKazini Job #{job_id}",
    }

    logger.info(f"[STK] Job #{job_id} | {phone} | KES {amount} | wallet #{wallet_id}")
    try:
        resp = requests.post(CHECKOUT_URL, json=payload, headers=HEADERS, timeout=30)
        logger.info(f"[STK] {resp.status_code}: {resp.text[:400]}")

        try:
            data = resp.json()
        except Exception:
            return {"success": False, "error": f"Non-JSON ({resp.status_code}): {resp.text[:200]}"}

        if resp.status_code in (200, 201, 202):
            d = data.get("data") or {}
            transaction_id = (
                d.get("id")
                or d.get("transaction_id")
                or d.get("transactionId")
                or d.get("invoice_id")
                or data.get("id")
                or data.get("transaction_id")
                or data.get("transactionId")
                or ""
            )
            transaction_id = str(transaction_id) if transaction_id else ""
            logger.info(f"[STK] OK Job #{job_id} | tx={transaction_id}")
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
# 3. POLL STATUS
# ─────────────────────────────────────────────────────────────────────────────

def check_payment_status(transaction_id: str) -> dict:
    url = f"{TRANSACTION_URL}/{transaction_id}"
    logger.debug(f"[Poll] GET {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        logger.info(f"[Poll] tx={transaction_id} → {resp.status_code}: {resp.text[:300]}")

        try:
            data = resp.json()
        except Exception:
            return {"success": False, "error": "Non-JSON from gateway"}

        if resp.status_code == 200:
            d = data.get("data") or {}
            raw_status = (
                d.get("status")
                or d.get("state")
                or data.get("status")
                or data.get("state")
                or "PENDING"
            )
            status = str(raw_status).upper().strip()

            # Normalise — gateway returns "COMPLETED" and "FAILED"
            if status in ("FAILED", "FAIL", "CANCELLED", "CANCELED"):
                status = "FAIL"
            elif status in ("COMPLETE", "COMPLETED"):
                status = "COMPLETE"
            else:
                status = "PENDING"

            logger.info(f"[Poll] tx={transaction_id} raw='{raw_status}' → '{status}'")
            return {"success": True, "status": status, "raw": data}

        return {"success": False, "error": f"HTTP {resp.status_code}: {str(data)[:200]}"}

    except requests.exceptions.Timeout:
        logger.warning(f"[Poll] Timeout tx={transaction_id} — will retry")
        return {"success": False, "error": "Timeout polling gateway"}
    except Exception as exc:
        logger.error(f"[Poll] Error tx={transaction_id}: {exc}")
        return {"success": False, "error": str(exc)}