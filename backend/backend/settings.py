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
    "services",
    "django_extensions",

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
        "NAME": config("DB_NAME", default="kaakazini_local"),
        "USER": config("DB_USER", default="kakaadmin_local"),
        "PASSWORD": config("DB_PASSWORD", default="kazikazi_local"),
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
# STATIC
# ---------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ---------------------------
# DIGITALOCEAN SPACES CONFIG
# ---------------------------
DO_SPACES_KEY = config("DO_SPACES_KEY")
DO_SPACES_SECRET = config("DO_SPACES_SECRET")
DO_SPACES_REGION = config("DO_SPACES_REGION", default="fra1")  
DO_SPACES_BUCKET_NAME = config("DO_SPACES_BUCKET_NAME", default="kaakazinibucket")

# Use S3 storage backend
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_ACCESS_KEY_ID = DO_SPACES_KEY
AWS_SECRET_ACCESS_KEY = DO_SPACES_SECRET
AWS_STORAGE_BUCKET_NAME = DO_SPACES_BUCKET_NAME
AWS_S3_ENDPOINT_URL = f"https://{DO_SPACES_REGION}.digitaloceanspaces.com"
AWS_QUERYSTRING_AUTH = False  # makes files public without signed URLs
AWS_DEFAULT_ACL = None  # recommended for S3/Spaces
MEDIA_URL = f"https://{DO_SPACES_BUCKET_NAME}.{DO_SPACES_REGION}.digitaloceanspaces.com/"

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
FRONTEND_URL = config("FRONTEND_URL", default="https://staging.kaakazini.com")
