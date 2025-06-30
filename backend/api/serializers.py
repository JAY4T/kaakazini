from rest_framework import serializers
from .models import Craftsman, Product, GalleryImage, Review, Service
from django.contrib.auth.models import User
# from .models import JobRequest
# from .models import Client
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import ContactMessage
from .models import JobRequest

# from accounts.models import Client








class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['image']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['reviewer', 'location', 'rating', 'comment']



class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'service_name', 'image']

class CraftsmanSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    gallery_images = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)


    class Meta:
        model = Craftsman
        fields = ['id','full_name', 'profile',  'description', 'status', 'profession','company_name', 'member_since',
                  'location','skills','video','gallery_images','reviews','primary_service','service_image','services']

        
    def get_gallery_images(self, obj):
        return [img.image.url for img in obj.gallery_images.all()]



class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image' ,'status']

    def create(self, validated_data):
        validated_data['craftsman'] = self.context['request'].user.craftsman
        return super().create(validated_data)




# class ClientSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Client
#         fields = '__all__'


# class JobRequestSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = JobRequest
#         fields = '__all__'
#         read_only_fields = ['status', 'review', 'created_at', 'client']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


class JobRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRequest
        fields = '__all__'