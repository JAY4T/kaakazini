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
)

User = get_user_model()

# ================== GALLERY IMAGE SERIALIZER ==================
class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ["id", "image_url"]

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None



# ================== REVIEW SERIALIZER ==================
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'location', 'rating', 'comment']


# ================== SERVICE SERIALIZER ==================

class ServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ["id", "service_name", "image_url"]

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None


# ================== SERVICE VIDEO SERIALIZER ==================
class ServiceVideoSerializer(serializers.ModelSerializer):
    video = serializers.FileField()

    class Meta:
        model = ServiceVideo
        fields = ['id', 'video']


class CraftsmanSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    service_videos = ServiceVideoSerializer(many=True, read_only=True)

    # ✅ URL fields for images
    profile_url = serializers.SerializerMethodField()
    service_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Craftsman
        fields = [
            'id',
            'full_name',
            'slug',

            # raw fields (keep for uploads/forms)
            'profile',
            'service_image',

            # public URLs (use in React)
            'profile_url',
            'service_image_url',

            'description',
            'status',
            'profession',
            'company_name',
            'member_since',
            'location',
            'skills',
            'video',
            'gallery_images',
            'is_approved',
            'is_active',
            'reviews',
            'primary_service',
            'services',
            'service_videos',
        ]

    def get_profile_url(self, obj):
        if obj.profile:
            return obj.profile.url
        return None

    def get_service_image_url(self, obj):
        if obj.service_image:
            return obj.service_image.url
        return None



# ================== PRODUCT SERIALIZER ==================
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "description",
            "image_url",
            "status",
            "is_approved",
        ]

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None



# ================== CONTACT MESSAGE SERIALIZER ==================
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'




class JobRequestSerializer(serializers.ModelSerializer):
    craftsman = serializers.SerializerMethodField()
    craftsman_name = serializers.CharField(source='craftsman.user.full_name', read_only=True)
    craftsman_id = serializers.IntegerField(source='craftsman.id', read_only=True)
    client = serializers.SerializerMethodField()
    quote_details = serializers.JSONField(read_only=True)
    quote_file_url = serializers.SerializerMethodField()  

    class Meta:
        model = JobRequest
        fields = '__all__'

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
            'phone': obj.client.phone_number
        }
    
    def get_quote_file_url(self, obj):
        if obj.quote_file:
            return obj.quote_file.url
        return None
