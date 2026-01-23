from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

# -----------------------------
# Base Signup Serializer
# -----------------------------
class BaseSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['full_name', 'email', 'password', 'phone_number', 'location', 'role', 'subscription']

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

# -----------------------------
# Craftsman Signup Serializer
# -----------------------------
class CraftsmanSignupSerializer(BaseSignupSerializer):
    def create(self, validated_data):
        validated_data['role'] = 'craftsman'
        return super().create(validated_data)

# -----------------------------
# Client Signup Serializer
# -----------------------------
class ClientSignupSerializer(BaseSignupSerializer):
    def create(self, validated_data):
        validated_data['role'] = 'client'
        return super().create(validated_data)

# -----------------------------
# Unified Role-Aware Login Serializer
# -----------------------------
class RoleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=False)  # optional

    def validate(self, data):
        email = data['email']
        password = data['password']
        role = data.get('role')  # optional

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        # Role enforcement only if provided
        if role == 'admin' and not user.is_staff:
            raise serializers.ValidationError("You are not authorized as admin.")
        if role and user.role != role and role != 'admin':
            raise serializers.ValidationError(f"You are not authorized as {role}.")

        self.context['user'] = user
        return data

# -----------------------------
# User Profile Serializer
# -----------------------------
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'phone_number', 'location', 'role', 'subscription']
