# api/serializers.py
import json
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Craftsman,
    Product,
    GalleryImage,
    Review,
    Service,
    ServiceVideo,
    ContactMessage,
    JobRequest,
    JobProofImage,
)

User = get_user_model()


# ─────────────────────────────────────────────
# Helper — builds full public URL for any file field
# ─────────────────────────────────────────────
def build_file_url(file_field):
    """
    Returns a full public URL for ImageField / FileField.
    - Spaces (USE_SPACES=True): file_field.url already returns full https:// URL
    - Local dev: prepend BACKEND_URL
    """
    if not file_field:
        return None
    try:
        url = file_field.url
        if url.startswith('http://') or url.startswith('https://'):
            return url
        backend = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
        return f"{backend}{url}"
    except Exception:
        return None


# ─────────────────────────────────────────────
# Gallery Image Serializer
# ─────────────────────────────────────────────
class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ['id', 'image_url']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Review Serializer
# ─────────────────────────────────────────────
class ReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'location', 'rating', 'comment', 'craftsman']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'full_name'):
            validated_data['reviewer'] = request.user.full_name
        return super().create(validated_data)


# ─────────────────────────────────────────────
# Service Serializer  ← UPDATED
# Now exposes name, rate, unit for the frontend ServicesEditor component
# ─────────────────────────────────────────────
class ServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    # `name` is a virtual write field the frontend sends; we resolve it to
    # service_name / custom_name on save (see CraftsmanDetailView)
    name = serializers.SerializerMethodField()
    rate = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    unit = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'service_name', 'custom_name', 'rate', 'unit', 'image_url']

    def get_image_url(self, obj):
        return build_file_url(obj.image)

    def get_name(self, obj):
        """Return the best human-readable name to the frontend."""
        return obj.get_display_name()


# ─────────────────────────────────────────────
# Service Video Serializer
# ─────────────────────────────────────────────
class ServiceVideoSerializer(serializers.ModelSerializer):
    video = serializers.FileField()

    class Meta:
        model = ServiceVideo
        fields = ['id', 'video']


# ─────────────────────────────────────────────
# Craftsman Serializer  ← MAIN FIX
# ─────────────────────────────────────────────
class CraftsmanSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    service_videos = ServiceVideoSerializer(many=True, read_only=True)
    profile_url = serializers.SerializerMethodField()
    service_image_url = serializers.SerializerMethodField()
    proof_document_url = serializers.SerializerMethodField()

    # ── Skills: stored as CSV in DB, exposed as list to the frontend ──
    skills = serializers.SerializerMethodField()

    # ── experience_level (new field) ──────────────────────────────────
    experience_level = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    # ── account_type ──────────────────────────────────────────────────
    account_type = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    class Meta:
        model = Craftsman
        fields = [
            'id', 'full_name', 'slug',
            'profile', 'service_image',
            'profile_url', 'service_image_url', 'proof_document_url',
            'description', 'status', 'profession', 'company_name',
            'member_since', 'location', 'skills', 'video',
            'gallery_images', 'is_approved', 'is_active',
            'reviews', 'primary_service', 'services', 'service_videos',
            'proof_document',
            # new fields
            'experience_level',
            'account_type',
        ]

    def get_profile_url(self, obj):
        return build_file_url(obj.profile)

    def get_service_image_url(self, obj):
        return build_file_url(obj.service_image)

    def get_proof_document_url(self, obj):
        if hasattr(obj, 'proof_document') and obj.proof_document:
            return build_file_url(obj.proof_document)
        return None

    def get_skills(self, obj):
        """Convert the comma-separated skills string → list for the frontend."""
        if not obj.skills:
            return []
        return [s.strip() for s in obj.skills.split(',') if s.strip()]


# ─────────────────────────────────────────────
# Product Serializer
# ─────────────────────────────────────────────
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image_url', 'status', 'is_approved']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Contact Message Serializer
# ─────────────────────────────────────────────
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


# ─────────────────────────────────────────────
# Job Proof Image Serializer
# ─────────────────────────────────────────────
class JobProofImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = JobProofImage
        fields = ['id', 'image_url', 'uploaded_at']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Job Request Serializer
# ─────────────────────────────────────────────
class JobRequestSerializer(serializers.ModelSerializer):
    craftsman = serializers.SerializerMethodField()
    craftsman_name = serializers.CharField(source='craftsman.user.full_name', read_only=True)
    craftsman_id = serializers.IntegerField(source='craftsman.id', read_only=True)
    client = serializers.SerializerMethodField()
    quote_details = serializers.JSONField(read_only=True)
    quote_file_url = serializers.SerializerMethodField()
    proof_images = serializers.SerializerMethodField()

    class Meta:
        model = JobRequest
        fields = '__all__'

    def get_proof_images(self, obj):
        images = obj.proof_images.all()
        return JobProofImageSerializer(images, many=True, context=self.context).data

    def get_craftsman(self, obj):
        if not obj.craftsman:
            return {'id': None, 'full_name': 'Unassigned', 'profession': None}
        return {
            'id': obj.craftsman.id,
            'full_name': obj.craftsman.user.full_name,
            'profession': obj.craftsman.profession,
        }

    def get_client(self, obj):
        if not obj.client:
            return {'id': None, 'full_name': 'Unknown', 'phone': None}
        return {
            'id': obj.client.id,
            'full_name': obj.client.full_name,
            'phone': obj.client.phone_number,
        }

    def get_quote_file_url(self, obj):
        return build_file_url(obj.quote_file)