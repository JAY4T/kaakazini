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
        fields = ['id', 'image']

class ServiceVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceVideo
        fields = ['id', 'video']

class ServiceSerializer(serializers.ModelSerializer):
    images = ServiceImageSerializer(many=True, read_only=True, source='craftsman.service_images')
    videos = ServiceVideoSerializer(many=True, read_only=True, source='craftsman.service_videos')

    class Meta:
        model = Service
        fields = ['id', 'service_name', 'custom_service_name', 'image', 'images', 'videos', 'is_approved']

# ------------------------- Craftsman -------------------------
class CraftsmanSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    gallery_images = serializers.SerializerMethodField()
    service_images = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Craftsman
        fields = [
            'id', 'full_name', 'slug', 'profile', 'description', 'status',
            'profession', 'company_name', 'member_since', 'location', 'skills',
            'primary_service', 'service_images', 'video', 'is_approved',
            'gallery_images', 'reviews', 'services'
        ]

    def get_service_images(self, obj):
        """
        Combine Craftsman main image + ServiceImage model images + Service model main images
        Deduplicate globally
        """
        request = self.context.get('request')
        images_set = set()

        # Add Craftsman main service_image
        if obj.service_image:
            images_set.add(request.build_absolute_uri(obj.service_image.url))

        # Add ServiceImage model images
        for img in obj.service_images.all():
            images_set.add(request.build_absolute_uri(img.image.url))

        # Add main images from approved services
        for svc in obj.services.filter(is_approved=True):
            if svc.image:
                images_set.add(request.build_absolute_uri(svc.image.url))
            for img in svc.craftsman.service_images.all():
                images_set.add(request.build_absolute_uri(img.image.url))

        return list(images_set)

    def get_services(self, obj):
        """
        Return all approved services for the craftsman including their videos.
        Deduplicate videos globally.
        """
        request = self.context.get('request')
        services_data = []
        global_videos = set()

        for s in obj.services.filter(is_approved=True):
            svc_videos = []

            # ServiceVideo model videos
            for vid in s.craftsman.service_videos.all():
                url = request.build_absolute_uri(vid.video.url)
                if url not in global_videos:
                    svc_videos.append(url)
                    global_videos.add(url)

            services_data.append({
                'id': s.id,
                'service_name': s.service_name,
                'custom_service_name': s.custom_service_name,
                'videos': svc_videos,
                'is_approved': s.is_approved
            })

        # Save global videos for gallery deduplication
        self._global_videos = global_videos
        return services_data

    def get_gallery_images(self, obj):
        """
        Return gallery images, deduplicated against all service images/videos
        """
        request = self.context.get('request')
        global_images = set(self.get_service_images(obj))  # deduplicate against service images
        gallery_list = []

        for img in obj.gallery_images.all():
            url = request.build_absolute_uri(img.image.url)
            if url not in global_images:
                gallery_list.append(url)
                global_images.add(url)  # Ensure no duplicates

        return gallery_list

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
