import os
import random
from django.core.files.base import ContentFile
from api.models import Craftsman, Service
from accounts.models import CustomUser
from datetime import date

# --- constants ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FULL_NAMES = [
    "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis"
]

PROFESSIONS = [
    "Carpenter", "Plumber", "Electrician", "Painter", "Tailor"
]

DESCRIPTIONS = [
    "Skilled in handmade furniture and woodwork.",
    "Experienced plumbing services for homes and offices.",
    "Certified electrician with 10 years of experience.",
    "Professional painter for interiors and exteriors.",
    "Expert tailor creating custom garments."
]

# Use relative paths to your scattered images
PROFILE_IMAGES = [
    os.path.join(BASE_DIR, "media", "profiles", "dorof.jpg"),
    os.path.join(BASE_DIR, "media", "profiles", "aisha.jpg"),
    os.path.join(BASE_DIR, "media", "profiles", "tailor1.jpg"),
]

SERVICE_NAMES = [
    "Plumbing", "Carpentry", "Electrical", "Painting", "Tailoring"
]

SERVICE_IMAGES = [
    os.path.join(BASE_DIR, "media", "services", "images", "electricaian.jpg"),
    os.path.join(BASE_DIR, "media", "services", "images", "welding.jpg"),
    os.path.join(BASE_DIR, "media", "services", "images", "woodenspoon.jpg"),
    os.path.join(BASE_DIR, "craftsmen", "clothes.jpg"),
]

MIN_APPROVED_CRAFTSMEN = 5  # ensure at least this many approved craftsmen


# --- helper to open local file ---
def load_local_image(path):
    """Load image from local filesystem as Django File."""
    try:
        with open(path, "rb") as f:
            return ContentFile(f.read(), name=os.path.basename(path))
    except Exception as e:
        print(f"⚠️ Failed to load local image {path}: {e}")
    return None


def populate_services():
    """
    Populate craftsmen + services with local images.
    Keeps superusers/real users intact, only clears dummy entries.
    Ensures at least MIN_APPROVED_CRAFTSMEN approved craftsmen.
    """
    print("⚡ Starting population...")

    # cleanup dummy data only (not real users)
    Service.objects.filter(craftsman__user__email__startswith="craftsman").delete()
    Craftsman.objects.filter(user__email__startswith="craftsman").delete()
    CustomUser.objects.filter(email__startswith="craftsman").delete()
    print("🗑️ Cleared previous dummy craftsmen/services (superusers preserved).")

    approved_craftsmen = 0
    craftsmen_list = []

    # create dummy craftsmen
    for i in range(len(FULL_NAMES)):
        email = f"craftsman{i}@example.com"
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "full_name": FULL_NAMES[i],
                "is_active": True,
            },
        )
        if created:
            user.set_password("password123")
            user.save()

        craftsman = Craftsman.objects.create(
            user=user,
            full_name=FULL_NAMES[i],
            profession=PROFESSIONS[i],
            description=DESCRIPTIONS[i],
            member_since=date.today(),
        )

        # profile image
        profile_path = random.choice(PROFILE_IMAGES)
        profile_file = load_local_image(profile_path)
        if profile_file:
            craftsman.profile.save(f"profile_{i}.jpg", profile_file, save=False)

        # primary service + service_image
        primary = random.choice(SERVICE_NAMES)
        craftsman.primary_service = primary

        service_path = random.choice(SERVICE_IMAGES)
        service_file = load_local_image(service_path)
        if service_file:
            craftsman.service_image.save(f"service_{i}.jpg", service_file, save=False)

        # approval logic
        if approved_craftsmen < MIN_APPROVED_CRAFTSMEN:
            craftsman.is_approved = True
            craftsman.status = "approved"
            approved_craftsmen += 1
        else:
            craftsman.is_approved = random.choice([True, False])
            craftsman.status = "approved" if craftsman.is_approved else "pending"
            if craftsman.is_approved:
                approved_craftsmen += 1

        craftsman.save()
        craftsmen_list.append(craftsman)

    # services for each craftsman
    total_approved_services = 0
    for craftsman in craftsmen_list:
        num_services = random.randint(1, 5)
        for j in range(num_services):
            service_name = random.choice(SERVICE_NAMES)
            img_path = random.choice(SERVICE_IMAGES)
            img_file = load_local_image(img_path)

            svc = Service(
                craftsman=craftsman,
                service_name=service_name,
                is_approved=random.choice([True, False]),
            )
            if img_file:
                svc.image.save(f"{service_name.lower()}_{craftsman.id}_{j}.jpg", img_file, save=True)
            else:
                svc.save()

            if svc.is_approved:
                total_approved_services += 1

    print(f"✅ Done. Approved craftsmen ensured: {min(approved_craftsmen, len(craftsmen_list))}.")
    print(f"   Created services, approved services count: {total_approved_services}")
