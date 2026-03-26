import logging
from .intasend_service import create_craftsman_wallet

logger = logging.getLogger(__name__)


def ensure_craftsman_wallet(craftsman) -> None:
    """
    Creates a gateway wallet for the craftsman if they don't have one yet.
    Call this inside AdminCraftsmanApproveView after setting is_approved=True.
    The wallet_id is saved to craftsman.wallet_id so payments route directly
    to them instead of the platform fallback wallet.
    """
    if craftsman.wallet_id:
        logger.info(
            f"[Approval] Craftsman #{craftsman.id} already has wallet #{craftsman.wallet_id}"
        )
        return

    name = (
        craftsman.full_name
        or getattr(craftsman.user, "get_full_name", lambda: "")()
        or f"Craftsman #{craftsman.id}"
    )

    result = create_craftsman_wallet(
        craftsman_name=name,
        craftsman_id=craftsman.id,
    )

    if result["success"]:
        from .models import Craftsman
        Craftsman.objects.filter(pk=craftsman.pk).update(wallet_id=result["wallet_id"])
        logger.info(
            f"[Approval] Wallet #{result['wallet_id']} saved for craftsman #{craftsman.id}"
        )
    else:
        logger.error(
            f"[Approval] Wallet creation FAILED for craftsman #{craftsman.id}: "
            f"{result.get('error')} — will fall back to platform wallet"
        )