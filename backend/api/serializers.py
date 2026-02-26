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
    JobProofImage
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
    reviewer = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'location', 'rating', 'comment', 'craftsman']

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request.user, "full_name"):
            validated_data["reviewer"] = request.user.full_name
        return super().create(validated_data)

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


# ================== CRAFTSMAN SERIALIZER ==================
class CraftsmanSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    service_videos = ServiceVideoSerializer(many=True, read_only=True)
    profile_url = serializers.SerializerMethodField()
    service_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Craftsman
        fields = [
            'id', 'full_name', 'slug', 'profile', 'service_image',
            'profile_url', 'service_image_url', 'description', 'status',
            'profession', 'company_name', 'member_since', 'location',
            'skills', 'video', 'gallery_images', 'is_approved', 'is_active',
            'reviews', 'primary_service', 'services', 'service_videos',
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
            "id", "name", "price", "description",
            "image_url", "status", "is_approved",
        ]

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None


# ================== CONTACT MESSAGE SERIALIZER ==================
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


# ================== JOB PROOF IMAGE SERIALIZER ==================
# ✅ ONLY ONE DEFINITION - Place BEFORE JobRequestSerializer
class JobProofImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = JobProofImage
        fields = ['id', 'image', 'uploaded_at']

    def get_image(self, obj):
        """Return full URL for the image"""
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class JobRequestSerializer(serializers.ModelSerializer):
    craftsman = serializers.SerializerMethodField()
    craftsman_name = serializers.CharField(source='craftsman.user.full_name', read_only=True)
    craftsman_id = serializers.IntegerField(source='craftsman.id', read_only=True)
    client = serializers.SerializerMethodField()
    quote_details = serializers.JSONField(read_only=True)
    quote_file_url = serializers.SerializerMethodField()
    
    # ✅ DECLARE AS SerializerMethodField
    proof_images = serializers.SerializerMethodField()

    class Meta:
        model = JobRequest
        fields = '__all__'

    def get_proof_images(self, obj):
        """Get all proof images with full URLs"""
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
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.quote_file.url)
            return obj.quote_file.url
        return None