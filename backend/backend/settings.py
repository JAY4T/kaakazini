import os
from pathlib import Path
from datetime import timedelta
from decouple import config
from corsheaders.defaults import default_headers

# ============================
# BASE CONFIG
# ============================
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# ENVIRONMENT
# ---------------------------
ENVIRONMENT = config("ENVIRONMENT", default="staging")  # staging or production
SECRET_KEY = config("DJANGO_SECRET_KEY", default="fallback-secret")
DEBUG = config("DJANGO_DEBUG", default=(ENVIRONMENT == "staging"), cast=bool)

ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

# ---------------------------
# APPLICATIONS
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
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "djoser",
    "django_rest_passwordreset",
    "django_extensions",
    "storages",  # DigitalOcean Spaces

    # Local apps
    "accounts",
    "api",
    "services",
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
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
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
]

# ---------------------------
# REST FRAMEWORK
# ---------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.authentication.CookieJWTAuthentication",  # cookie JWT
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# ---------------------------
# CORS / CSRF / COOKIE SETTINGS
# ---------------------------
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://staging.kaakazini.com,https://kaakazini.com,https://www.kaakazini.com",
    cast=lambda v: [s.strip() for s in v.split(",")]
)
CORS_ALLOW_HEADERS = list(default_headers) + ["authorization"]

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="https://staging.kaakazini.com,https://kaakazini.com,https://www.kaakazini.com",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=True, cast=bool)
CSRF_COOKIE_SECURE = config("CSRF_COOKIE_SECURE", default=True, cast=bool)
SESSION_COOKIE_SAMESITE = config("SESSION_COOKIE_SAMESITE", default="None")
CSRF_COOKIE_SAMESITE = config("CSRF_COOKIE_SAMESITE", default="None")
SESSION_COOKIE_HTTPONLY = config("SESSION_COOKIE_HTTPONLY", default=True, cast=bool)
CSRF_COOKIE_HTTPONLY = config("CSRF_COOKIE_HTTPONLY", default=False, cast=bool)
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)

SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=31536000, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config("SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True, cast=bool)
SECURE_HSTS_PRELOAD = config("SECURE_HSTS_PRELOAD", default=True, cast=bool)

# ---------------------------
# DIGITALOCEAN SPACES (MEDIA)
# ---------------------------
USE_SPACES = config("USE_SPACES", default=True, cast=bool)

if USE_SPACES:
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    AWS_ACCESS_KEY_ID = config("DO_SPACES_KEY")
    AWS_SECRET_ACCESS_KEY = config("DO_SPACES_SECRET")
    AWS_STORAGE_BUCKET_NAME = config("DO_SPACES_BUCKET")
    AWS_S3_REGION_NAME = config("DO_SPACES_REGION", default="fra1")
    AWS_S3_ENDPOINT_URL = f"https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com"
    AWS_DEFAULT_ACL = "public-read"
    AWS_QUERYSTRING_AUTH = False
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_REGION_NAME}.digitaloceanspaces.com/"
else:
    # fallback to local filesystem
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"


# ---------------------------
# STATIC
# ---------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ---------------------------
# SECURITY
# ---------------------------
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# ---------------------------
# OTHER
# ---------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")
BREVO_API_KEY = config("BREVO_API_KEY", default="")

