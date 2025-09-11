# accounts/views.py
from rest_framework import generics
from .serializers import LoginSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
import os
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ClientLoginSerializer

from rest_framework import generics, status
from rest_framework.response import Response
from .models import CustomUser
from .serializers import ClientSignupSerializer, ClientLoginSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import complete_signup

import logging

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        user = serializer.save()

        # Complete signup: send Brevo email + generate JWT
        tokens = complete_signup(user)

        return Response({
            "detail": "Craftsman account created successfully",
            **tokens
        }, status=status.HTTP_201_CREATED)
    
    
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID") or '551247510793-ria1stm1obcn36nkkl2is4tknoqaj2sv.apps.googleusercontent.com'

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"detail": "No token provided"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo["email"]
            full_name = idinfo.get("name", "")

            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={"full_name": full_name}
            )

            # DEBUG: log user creation
            logger.info(f"User {email} created? {created}")

            # Send welcome email only if newly created
            if created:
                logger.info(f"Sending welcome email to {email}")
                complete_signup(user)

            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        except Exception as e:
            logger.error(f"Google signup failed for token: {token}, error: {e}")
            return Response({"detail": "Invalid Google token"}, status=400)

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        email = username  # username param will be email here
        if email is None or password is None:
            return None
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None




class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.context['user']
            if not user.is_staff:
                return Response({'detail': 'You are not authorized as admin.'}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'is_staff': user.is_staff,
                'email': user.email,
            })

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)



class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.context['user']
            refresh = RefreshToken.for_user(user)

            return Response({
                'id': user.id,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'email': user.email,
                'full_name': user.full_name,
                'phone_number': user.phone_number,
            })

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)








class ClientSignupView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = ClientSignupSerializer
    permission_classes = [AllowAny]  


    def perform_create(self, serializer):
        user = serializer.save()

        # ✅ Send Brevo welcome email here
        from .utils import send_welcome_email
        try:
            send_welcome_email(user.email, user.full_name)
        except Exception as e:
            logger.error(f"Failed to send Brevo email to {user.email}: {e}")



class ClientLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'token': str(refresh.access_token),
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'role': user.role,
            }
        })