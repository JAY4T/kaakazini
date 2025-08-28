# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser
from .utils import send_sms
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=CustomUser)
def send_sms_on_signup(sender, instance, created, **kwargs):
    if created:
        logger.info(f"✅ Signal triggered for: {instance.phone_number}")
        send_sms(instance.phone_number, "Welcome to the  Kaakazini platform!")