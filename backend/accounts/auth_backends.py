# from django.contrib.auth.backends import BaseBackend
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class EmailOrPhoneBackend(BaseBackend):
#     def authenticate(self, request, username=None, password=None, **kwargs):
#         try:
#             user = User.objects.get(email=username)
#         except User.DoesNotExist:
#             try:
#                 user = User.objects.get(phone_number=username)
#             except User.DoesNotExist:
#                 return None

#         if user.check_password(password) and user.is_active:
#             return user
#         return None
