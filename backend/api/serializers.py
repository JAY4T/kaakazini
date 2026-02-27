# api/serializers.py
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
# Works for both local storage AND Digital Ocean Spaces
# ─────────────────────────────────────────────
def build_file_url(file_field):
    """
    Returns a full public URL for ImageField / FileField.

    - Spaces (USE_SPACES=True):
        file_field.url already returns full https:// URL → return as-is

    - Local dev (USE_SPACES=False):
        file_field.url returns /media/profiles/photo.jpg
        → prepend BACKEND_URL to make it absolute
    """
    if not file_field:
        return None
    try:
        url = file_field.url
        # Already a full URL (Spaces CDN)
        if url.startswith('http://') or url.startswith('https://'):
            return url
        # Local — make it absolute
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
        model  = GalleryImage
        fields = ['id', 'image_url']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Review Serializer
# ─────────────────────────────────────────────
class ReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model  = Review
        fields = ['id', 'reviewer', 'location', 'rating', 'comment', 'craftsman']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'full_name'):
            validated_data['reviewer'] = request.user.full_name
        return super().create(validated_data)


# ─────────────────────────────────────────────
# Service Serializer
# ─────────────────────────────────────────────
class ServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Service
        fields = ['id', 'service_name', 'image_url']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Service Video Serializer
# ─────────────────────────────────────────────
class ServiceVideoSerializer(serializers.ModelSerializer):
    video = serializers.FileField()

    class Meta:
        model  = ServiceVideo
        fields = ['id', 'video']


# ─────────────────────────────────────────────
# Craftsman Serializer  ← THE MAIN FIX IS HERE
# ─────────────────────────────────────────────
class CraftsmanSerializer(serializers.ModelSerializer):
    full_name          = serializers.CharField(source='user.full_name', read_only=True)
    gallery_images     = GalleryImageSerializer(many=True, read_only=True)
    reviews            = ReviewSerializer(many=True, read_only=True)
    services           = ServiceSerializer(many=True, read_only=True)
    service_videos     = ServiceVideoSerializer(many=True, read_only=True)
    profile_url        = serializers.SerializerMethodField()
    service_image_url  = serializers.SerializerMethodField()
    proof_document_url = serializers.SerializerMethodField()  

    class Meta:
        model  = Craftsman
        fields = [
            'id', 'full_name', 'slug',
            'profile', 'service_image',
            'profile_url', 'service_image_url', 'proof_document_url', 
            'description', 'status', 'profession', 'company_name',
            'member_since', 'location', 'skills', 'video',
            'gallery_images', 'is_approved', 'is_active',
            'reviews', 'primary_service', 'services', 'service_videos',
            'proof_document',   
        ]

    def get_profile_url(self, obj):
        return build_file_url(obj.profile)

    def get_service_image_url(self, obj):
        return build_file_url(obj.service_image)

    def get_proof_document_url(self, obj):
        return build_file_url(obj.proof_document) if hasattr(obj, 'proof_document') and obj.proof_document else None


# ─────────────────────────────────────────────
# Product Serializer
# ─────────────────────────────────────────────
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'name', 'price', 'description', 'image_url', 'status', 'is_approved']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Contact Message Serializer
# ─────────────────────────────────────────────
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = '__all__'


# ─────────────────────────────────────────────
# Job Proof Image Serializer
# ─────────────────────────────────────────────
class JobProofImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = JobProofImage
        fields = ['id', 'image_url', 'uploaded_at']

    def get_image_url(self, obj):
        return build_file_url(obj.image)


# ─────────────────────────────────────────────
# Job Request Serializer
# ─────────────────────────────────────────────
class JobRequestSerializer(serializers.ModelSerializer):
    craftsman       = serializers.SerializerMethodField()
    craftsman_name  = serializers.CharField(source='craftsman.user.full_name', read_only=True)
    craftsman_id    = serializers.IntegerField(source='craftsman.id', read_only=True)
    client          = serializers.SerializerMethodField()
    quote_details   = serializers.JSONField(read_only=True)
    quote_file_url  = serializers.SerializerMethodField()
    proof_images    = serializers.SerializerMethodField()

    class Meta:
        model  = JobRequest
        fields = '__all__'

    def get_proof_images(self, obj):
        images = obj.proof_images.all()
        return JobProofImageSerializer(
            images,
            many=True,
            context=self.context
        ).data

    def get_craftsman(self, obj):
        if not obj.craftsman:
            return {'id': None, 'full_name': 'Unassigned', 'profession': None}
        return {
            'id':         obj.craftsman.id,
            'full_name':  obj.craftsman.user.full_name,
            'profession': obj.craftsman.profession,
        }

    def get_client(self, obj):
        if not obj.client:
            return {'id': None, 'full_name': 'Unknown', 'phone': None}
        return {
            'id':        obj.client.id,
            'full_name': obj.client.full_name,
            'phone':     obj.client.phone_number,
        }

    def get_quote_file_url(self, obj):
        return build_file_url(obj.quote_file)