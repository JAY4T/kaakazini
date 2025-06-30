from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Craftsman

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_craftsman(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'craftsman'):
        Craftsman.objects.create(
            user=instance,
            full_name=instance.get_full_name() or instance.username,
            description="New craftsman profile."
        )
