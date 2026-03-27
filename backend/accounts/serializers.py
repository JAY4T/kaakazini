from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class BaseSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = CustomUser
        fields = ['full_name', 'email', 'password', 'phone_number', 'location', 'role', 'subscription']

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class CraftsmanSignupSerializer(BaseSignupSerializer):
    def create(self, validated_data):
        validated_data['role']        = 'craftsman'
        validated_data['active_role'] = 'craftsman'   # default active mode on signup
        return super().create(validated_data)


class ClientSignupSerializer(BaseSignupSerializer):
    def create(self, validated_data):
        validated_data['role']        = 'client'
        validated_data['active_role'] = 'client'      # default active mode on signup
        return super().create(validated_data)


class RoleLoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role     = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=True)

    def validate(self, data):
        email    = data['email']
        password = data['password']
        role     = data['role']

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if role == 'admin':
            if not (user.is_staff or user.is_superuser):
                raise serializers.ValidationError(
                    "Access denied. This account is not an admin."
                )
        else:
            if user.role != role:
                raise serializers.ValidationError(
                    f"Access denied. Please use the {user.role} login page."
                )

        self.context['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = [
            'id', 'email', 'full_name', 'phone_number',
            'location', 'role', 'subscription',
            'active_role',   # ── NEW: tells the frontend which mode the user is in
        ]


class SwitchRoleSerializer(serializers.Serializer):
    """Validates the role passed to the switch-role endpoint."""
    role = serializers.ChoiceField(choices=[('craftsman', 'Craftsman'), ('client', 'Client')])