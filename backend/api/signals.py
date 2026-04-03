from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import JobRequest, Craftsman, AvailabilityNotificationRequest

BUSY_STATUSES = {
    JobRequest.STATUS_ACCEPTED,
    JobRequest.STATUS_IN_PROGRESS,
}


# ── Craftsman slug auto-generation ────────────────────────────────────────────

@receiver(pre_save, sender=Craftsman)
def generate_craftsman_slug(sender, instance, **kwargs):
    if not instance.slug and instance.user:
        # Prefer craftsman.full_name, then user.full_name, then username
        full_name = (
            instance.full_name
            or getattr(instance.user, "full_name", None)
            or f"{instance.user.first_name} {instance.user.last_name}".strip()
            or instance.user.username
            or f"craftsman-{instance.pk or 'new'}"
        )
        base_slug = slugify(full_name)
        slug      = base_slug
        counter   = 1

        while Craftsman.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        instance.slug = slug


# ── Cache old job status before save ─────────────────────────────────────────

@receiver(pre_save, sender=JobRequest)
def cache_old_job_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_status = JobRequest.objects.get(pk=instance.pk).status
        except JobRequest.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


# ── Sync craftsman availability after any JobRequest save ─────────────────────

@receiver(post_save, sender=JobRequest)
def sync_craftsman_availability(sender, instance, created, **kwargs):
    craftsman = instance.craftsman
    if not craftsman:
        return

    old_status = getattr(instance, '_old_status', None)
    new_status = instance.status

    # Always sync on create; on update only when status actually changed
    if not created and old_status == new_status:
        return

    # Re-compute availability from ALL jobs (not just this one)
    craftsman.sync_availability()
    _broadcast_status(craftsman)

    # Notify waiting clients if craftsman just became free
    if craftsman.availability_status == 'online' and old_status in BUSY_STATUSES:
        _notify_waiting_clients(craftsman)


# ── Broadcast helpers ─────────────────────────────────────────────────────────

def _broadcast_status(craftsman):
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return
        group_name = f'craftsman_status_{craftsman.id}'
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type':   'status_update',
                'status': craftsman.availability_status,
            }
        )
    except Exception:
        pass  # Redis not available in dev — skip silently


def _notify_waiting_clients(craftsman):
    pending = AvailabilityNotificationRequest.objects.filter(
        craftsman=craftsman, notified=False
    ).select_related('client')

    now = timezone.now()
    for notif in pending:
        try:
            send_mail(
                subject=f"{craftsman.full_name} is now available on Kaakazini!",
                message=(
                    f"Hi {notif.client.full_name},\n\n"
                    f"{craftsman.full_name} ({craftsman.primary_service}) "
                    f"just finished their job and is now available.\n\n"
                    f"Book them before they get busy again:\n"
                    f"{settings.FRONTEND_URL}/craftsmen/{craftsman.slug}\n\n"
                    f"— The Kaakazini Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notif.client.email],
                fail_silently=True,
            )
        except Exception:
            pass

    pending.update(notified=True, notified_at=now)
