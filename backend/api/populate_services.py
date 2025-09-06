import os
import random
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

# Relative paths to existing images
PROFILE_IMAGES = [
    "profiles/dorof.jpg",
    "profiles/aisha.jpg",
    "profiles/tailor1.jpg",
]

SERVICE_NAMES = [
    "Plumbing", "Carpentry", "Electrical", "Painting", "Tailoring"
]

SERVICE_IMAGES = [
    "services/images/electricaian.jpg",
    "services/images/welding.jpg",
    "services/images/woodenspoon.jpg",
    "craftsmen/clothes.jpg",
]

MIN_APPROVED_CRAFTSMEN = 5  # ensure at least this many approved craftsmen


def populate_services():
    print("⚡ Starting population...")

    # --- cleanup dummy data only (superusers/real users preserved) ---
    Service.objects.filter(craftsman__user__email__startswith="craftsman").delete()
    Craftsman.objects.filter(user__email__startswith="craftsman").delete()
    CustomUser.objects.filter(email__startswith="craftsman").delete()
    print("🗑️ Cleared previous dummy craftsmen/services.")

    approved_craftsmen = 0
    craftsmen_list = []

    # --- create dummy craftsmen ---
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
            # Assign profile and service images as relative paths
            profile=random.choice(PROFILE_IMAGES),
            service_image=random.choice(SERVICE_IMAGES),
            primary_service=random.choice(SERVICE_NAMES),
        )

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

    # --- create services for each craftsman ---
    total_approved_services = 0
    for craftsman in craftsmen_list:
        num_services = random.randint(1, 5)
        for j in range(num_services):
            service_name = random.choice(SERVICE_NAMES)
            img_path = random.choice(SERVICE_IMAGES)

            svc = Service(
                craftsman=craftsman,
                service_name=service_name,
                image=img_path,  # store relative path only
                is_approved=random.choice([True, False]),
            )
            svc.save()

            if svc.is_approved:
                total_approved_services += 1

    print(f"✅ Done. Approved craftsmen ensured: {min(approved_craftsmen, len(craftsmen_list))}.")
    print(f"   Created services, approved services count: {total_approved_services}")
