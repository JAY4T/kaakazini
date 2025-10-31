from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from .models import Craftsman

@receiver(pre_save, sender=Craftsman)
def generate_craftsman_slug(sender, instance, **kwargs):
    if not instance.slug and instance.user:
        full_name = getattr(instance.user, "full_name", None)
        if not full_name:
            full_name = f"{instance.user.first_name} {instance.user.last_name}".strip() or instance.user.username
        
        base_slug = slugify(full_name)
        slug = base_slug
        counter = 1

        while Craftsman.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        instance.slug = slug
