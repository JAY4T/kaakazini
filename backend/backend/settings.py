import os
from pathlib import Path
from datetime import timedelta
from decouple import config
from corsheaders.defaults import default_headers

# ---------------------------
# BASE CONFIG
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="fallback-secret-for-dev")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    default="localhost,127.0.0.1,staging.kaakazini.com,kaakazini.com,www.kaakazini.com",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

# ---------------------------
# APPS
# ---------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "djoser",
    "django_rest_passwordreset",
    "storages", 
    
    # Local apps
    "api",
    "accounts",
]

# ---------------------------
# MIDDLEWARE
# ---------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# ---------------------------
# DATABASE
# ---------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="kakaazini_staging"),
        "USER": config("DB_USER", default="kakaadmin_staging"),
        "PASSWORD": config("DB_PASSWORD", default="kazikazi"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# ---------------------------
# AUTHENTICATION
# ---------------------------
AUTH_USER_MODEL = "accounts.CustomUser"
AUTHENTICATION_BACKENDS = [
    "accounts.authentication.EmailBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# ---------------------------
# REST FRAMEWORK
# ---------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# ---------------------------
# CORS / CSRF
# ---------------------------
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = list(default_headers) + ["authorization"]
CSRF_TRUSTED_ORIGINS = [
    "https://staging.kaakazini.com",
    "https://kaakazini.com",
    "https://www.kaakazini.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# ---------------------------
# STATIC & MEDIA
# ---------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ---------------------------
# DIGITALOCEAN SPACES STORAGE
# ---------------------------
USE_SPACES = config("USE_SPACES", default=False, cast=bool)

if USE_SPACES:
    AWS_ACCESS_KEY_ID = config("SPACES_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = config("SPACES_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = config("SPACES_BUCKET_NAME")
    AWS_S3_REGION_NAME = config("SPACES_REGION", default="fra1")
    AWS_S3_ENDPOINT_URL = config("SPACES_ENDPOINT_URL", default=f"https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com")
    AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_REGION_NAME}.digitaloceanspaces.com"

    AWS_DEFAULT_ACL = "public-read"
    AWS_QUERYSTRING_AUTH = False

    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

    # ✅ FIXED: no "media/" prefix, since bucket root is empty
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"
    MEDIA_ROOT = ""
else:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"




# ---------------------------
# SECURITY
# ---------------------------
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
X_FRAME_OPTIONS = "DENY"

# ---------------------------
# OTHER CONFIG
# ---------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

BREVO_API_KEY = config("BREVO_API_KEY", default="")
FRONTEND_URL = config("FRONTEND_URL", default="https://kaakazini.com")
