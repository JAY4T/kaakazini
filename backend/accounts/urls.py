from django.urls import path
from rest_framework_simplejwt.views import ( # type: ignore
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, GoogleLoginView
from .views import AdminLoginAPIView, LoginAPIView
from .views import ProfileView
from .views import ClientSignupView, ClientLoginView
from .views import PasswordResetView, PasswordResetConfirmView


# from .token import CustomTokenObtainPairView






urlpatterns = [
    path('signup/', RegisterView.as_view(), name='signup'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    

    # admin
    path('admin-login/', AdminLoginAPIView.as_view(), name='admin-login'),

    # Hiring Clients
    path('client-signup/', ClientSignupView.as_view(), name='client-signup'),
    path('client-login/', ClientLoginView.as_view(), name='client-login'),
]






   


