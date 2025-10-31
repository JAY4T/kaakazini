from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Craftsman, Product, GalleryImage, Review, Service,
    ServiceImage, ServiceVideo, ContactMessage, JobRequest
)


# ------------------------- Gallery Image -------------------------
class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['image']


# ------------------------- Review -------------------------
class ReviewSerializer(serializers.ModelSerializer):
    craftsman_name = serializers.CharField(source='craftsman.user.full_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['created_at']

    def create(self, validated_data):
        if not validated_data.get("job"):
            craftsman = validated_data.get("craftsman")
            validated_data["job"] = JobRequest.objects.filter(craftsman=craftsman).last()
        return super().create(validated_data)


# ------------------------- Service Images & Videos -------------------------
class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = '__all__'


class ServiceVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceVideo
        fields = '__all__'


# ------------------------- Service -------------------------
class ServiceSerializer(serializers.ModelSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)
    videos = ServiceVideoSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = '__all__'



class CraftsmanSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    slug = serializers.SlugField(read_only=True)
    gallery_images = serializers.SerializerMethodField()
    service_image = serializers.SerializerMethodField()
    service_images = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Craftsman
        fields = [
            'id', 'slug', 'full_name', 'profile', 'description', 'status',
            'profession', 'company_name', 'member_since', 'location', 'skills',
            'primary_service', 'service_image', 'service_images',
            'video', 'proof_document', 'is_approved',
            'gallery_images', 'reviews', 'services'
        ]

    def get_gallery_images(self, obj):
        request = self.context.get('request')
        if obj.gallery_images.exists():
            return [request.build_absolute_uri(img.image.url) for img in obj.gallery_images.all()]
        return []

    def get_service_image(self, obj):
        request = self.context.get('request')
        if obj.service_image:
            return request.build_absolute_uri(obj.service_image.url)
        return None

    def get_service_images(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'service_images') and obj.service_images.exists():
            return [request.build_absolute_uri(img.image.url) for img in obj.service_images.all()]
        return []

    # ✅ ADD THIS UPDATE METHOD
    def update(self, instance, validated_data):
        request = self.context.get('request')

        # Handle normal text fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle file uploads
        if request.FILES.get('profile'):
            instance.profile = request.FILES['profile']

        if request.FILES.get('proof_document'):
            instance.proof_document = request.FILES['proof_document']

        # ✅ Handle multiple service_images
        service_images = request.FILES.getlist('service_images')
        if service_images:
            from .models import ServiceImage
            for img in service_images:
                ServiceImage.objects.create(craftsman=instance, image=img)

        # ✅ Handle multiple service_videos (if any)
        service_videos = request.FILES.getlist('service_videos')
        if service_videos:
            from .models import ServiceVideo
            for vid in service_videos:
                ServiceVideo.objects.create(craftsman=instance, video=vid)

        instance.save()
        return instance


# ------------------------- Product -------------------------
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image', 'status']

    def create(self, validated_data):
        validated_data['craftsman'] = self.context['request'].user.craftsman
        return super().create(validated_data)


# ------------------------- Contact Message -------------------------
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


# ------------------------- Job Request -------------------------
class JobRequestSerializer(serializers.ModelSerializer):
    craftsman = serializers.SerializerMethodField(read_only=True)
    craftsman_name = serializers.CharField(source='craftsman.user.full_name', read_only=True)
    craftsman_id = serializers.IntegerField(source='craftsman.id', read_only=True)
    client = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobRequest
        fields = [
            'id', 'service', 'description', 'status', 'craftsman', 'craftsman_id', 'craftsman_name',
            'schedule', 'address', 'location', 'name', 'phone', 'custom_service',
            'isUrgent', 'media', 'review', 'created_at', 'client'
        ]

    def get_craftsman(self, obj):
        if obj.craftsman:
            return {
                'id': obj.craftsman.id,
                'full_name': obj.craftsman.user.full_name,
                'profession': obj.craftsman.profession,
            }
        return None

    def get_client(self, obj):
        if obj.client:
            return {
                'id': obj.client.id,
                'full_name': obj.client.full_name,
                'phone': obj.client.phone_number
            }
        return None
