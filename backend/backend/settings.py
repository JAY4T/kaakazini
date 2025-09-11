from pathlib import Path
from datetime import timedelta
from decouple import config
from corsheaders.defaults import default_headers

# ---------------------------
# BASE DIR
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# SECURITY
# ---------------------------
SECRET_KEY = config('DJANGO_SECRET_KEY', default='fallback-secret-for-dev')
DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

CSRF_TRUSTED_ORIGINS = [
    'https://staging.kaakazini.com',
    'https://kaakazini.com',
    'https://www.kaakazini.com',
]

# ---------------------------
# CORS
# ---------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'https://staging.kaakazini.com',
    'https://kaakazini.com',
    'https://www.kaakazini.com',
]
CORS_ALLOW_HEADERS = list(default_headers) + ['authorization']
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Type', 'Authorization']

# ---------------------------
# CUSTOM USER MODEL & AUTH
# ---------------------------
AUTH_USER_MODEL = 'accounts.CustomUser'
AUTHENTICATION_BACKENDS = [
    'accounts.authentication.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ---------------------------
# INSTALLED APPS
# ---------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'djoser',

    # Local apps
    'api',
    'accounts',
    'django_rest_passwordreset',
]

# ---------------------------
# MIDDLEWARE
# ---------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ---------------------------
# URLS & TEMPLATES
# ---------------------------
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ---------------------------
# DATABASE
# ---------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='kakaazini_staging'),
        'USER': config('DB_USER', default='kakaadmin_staging'),
        'PASSWORD': config('DB_PASSWORD', default='kazikazi'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# ---------------------------
# REST FRAMEWORK & JWT
# ---------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "password_reset": "3/hour",
        "password_reset_confirm": "10/hour",
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# ---------------------------
# PASSWORD VALIDATION
# ---------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------
# INTERNATIONALIZATION
# ---------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# ---------------------------
# STATIC & MEDIA
# ---------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------
# SECURITY HEADERS
# ---------------------------
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# ---------------------------
# BREVO (SENDINBLUE) CONFIG
# ---------------------------

import os

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp-relay.brevo.com"
EMAIL_PORT = 465  # Use 465 if you prefer SSL
EMAIL_USE_TLS = False  # True for 587, False for 465
EMAIL_USE_SSL = True

EMAIL_HOST_USER = os.getenv("BREVO_EMAIL", "935244001@smtp-brevo.com")  # Your Brevo registered email
EMAIL_HOST_PASSWORD = os.getenv("BREVO_SMTP_KEY")  # Your SMTP API key
DEFAULT_FROM_EMAIL = f"Kaakazini <{EMAIL_HOST_USER}>"
