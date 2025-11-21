import os
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
    'django_rest_passwordreset',
    'storages',

    # Local apps
    'api',
    'accounts',
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
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

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

# ---------------------------
# DIGITALOCEAN SPACES STORAGE
# ---------------------------
DO_SPACES_KEY = config("DO_SPACES_KEY")
DO_SPACES_SECRET = config("DO_SPACES_SECRET")
DO_SPACES_REGION = config("DO_SPACES_REGION", default="fra1")
DO_SPACES_BUCKET_NAME = config("DO_SPACES_BUCKET_NAME", default="kaakazinibucket")

DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_ACCESS_KEY_ID = DO_SPACES_KEY
AWS_SECRET_ACCESS_KEY = DO_SPACES_SECRET
AWS_STORAGE_BUCKET_NAME = DO_SPACES_BUCKET_NAME
AWS_S3_ENDPOINT_URL = f"https://{DO_SPACES_REGION}.digitaloceanspaces.com"
AWS_S3_REGION_NAME = DO_SPACES_REGION
AWS_QUERYSTRING_AUTH = False
AWS_DEFAULT_ACL = None

MEDIA_URL = f"https://{DO_SPACES_BUCKET_NAME}.{DO_SPACES_REGION}.digitaloceanspaces.com/"

# ---------------------------
# SECURITY HEADERS
# ---------------------------
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# ---------------------------
# BREVO
# ---------------------------
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
