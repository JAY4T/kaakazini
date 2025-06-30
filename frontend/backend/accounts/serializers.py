from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
# from .models import Client



User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'password', 'phone_number', 'location', 'subscription', 'role')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        self.context['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number', 'location', 'role', 'subscription']



from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

class ClientSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['full_name', 'email', 'phone_number', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['role'] = 'client'
        return CustomUser.objects.create_user(**validated_data)
    




class ClientLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if user.role != 'client':
            raise serializers.ValidationError("You are not authorized as a client.")

        return {'user': user}
