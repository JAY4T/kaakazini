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
    image = serializers.ImageField()

    class Meta:
        model = GalleryImage
        fields = ['id', 'image']


# ================== REVIEW SERIALIZER ==================
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'location', 'rating', 'comment']


# ================== SERVICE SERIALIZER ==================

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'service_name', 'image']


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
    service_image = serializers.ImageField(required=False, allow_null=True)
    service_videos = ServiceVideoSerializer(many=True, read_only=True)

    class Meta:
        model = Craftsman
        fields = [
            'id',
            'full_name',
            'slug',  
            'profile',
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
            'reviews',
            'primary_service',
            'services',
            'service_image', 
            'service_videos',
        ]

    



# ================== PRODUCT SERIALIZER ==================
class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image', 'status', 'is_approved']

    def create(self, validated_data):
        validated_data['craftsman'] = self.context['request'].user.craftsman
        return super().create(validated_data)


# ================== CONTACT MESSAGE SERIALIZER ==================
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'




class JobRequestSerializer(serializers.ModelSerializer):
    craftsman = serializers.SerializerMethodField(read_only=True)
    craftsman_name = serializers.CharField(source='craftsman.user.full_name', read_only=True)
    craftsman_id = serializers.IntegerField(source='craftsman.id', read_only=True)
    client = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobRequest
        fields = [
            'id', 'client', 'craftsman', 'craftsman_id', 'craftsman_name',
            'service', 'custom_service', 'description', 'schedule',
            'address', 'location', 'name', 'phone', 'isUrgent', 'media',
            'status', 'review', 'created_at',
            'budget', 'distance_km', 'start_time', 'end_time',
            'duration_hours', 'expected_end', 'overtime_hours',
            'total_payment', 'company_fee', 'net_payment',
        ]
        read_only_fields = [
            'distance_km', 'duration_hours', 'expected_end', 'overtime_hours',
            'total_payment', 'company_fee', 'net_payment',
            'status', 'created_at'
        ]

    def get_craftsman(self, obj):
        if not obj.craftsman:
            return None
        return {
            'id': obj.craftsman.id,
            'full_name': obj.craftsman.user.full_name,
            'profession': obj.craftsman.profession,
        }

    def get_client(self, obj):
        if not obj.client:
            return None
        return {
            'id': obj.client.id,
            'full_name': obj.client.full_name,
            'phone': obj.client.phone_number
        }