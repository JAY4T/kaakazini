import os
from pathlib import Path
from datetime import timedelta
from decouple import config
from corsheaders.defaults import default_headers

# ============================
# BASE CONFIG
# ============================
BASE_DIR = Path(__file__).resolve().parent.parent

# ============================
# ENVIRONMENT
# ============================
ENVIRONMENT = config("ENVIRONMENT", default="local")  # local, staging, production

SECRET_KEY = config("DJANGO_SECRET_KEY", default="fallback-secret")

# ============================
# DEBUG
# ============================
DEBUG = ENVIRONMENT == "local"

# ============================
# HOSTS
# ============================
if ENVIRONMENT == "local":
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
else:
    ALLOWED_HOSTS = config(
        "DJANGO_ALLOWED_HOSTS",
        default="localhost,127.0.0.1,staging.kaakazini.com,kaakazini.com,www.kaakazini.com"
    ).split(",")


# ============================
# APPLICATIONS
# ============================
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

    # Local apps
    "accounts",
    "api",
    "services",
]

# ============================
# MIDDLEWARE
# ============================
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

# ============================
# DATABASE (PostgreSQL)
# ============================
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

# ============================
# AUTHENTICATION
# ============================
AUTH_USER_MODEL = "accounts.CustomUser"

AUTHENTICATION_BACKENDS = [
    "accounts.authentication.EmailBackend",
]

# ============================
# REST FRAMEWORK
# ============================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# ============================
# SIMPLE JWT
# ============================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_COOKIE": "access_token",  # Cookie name for access token
    "AUTH_COOKIE_REFRESH": "refresh_token",  # Cookie name for refresh token
    "AUTH_COOKIE_SECURE": ENVIRONMENT != "local",  # HTTPS only in staging/prod
    "AUTH_COOKIE_HTTP_ONLY": True,
    "AUTH_COOKIE_SAMESITE": "Lax",
}

# ============================
# CORS / CSRF
# ============================
CORS_ALLOW_CREDENTIALS = True

if ENVIRONMENT == "local":
    CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
    CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]
else:
    CORS_ALLOWED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS]
    CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS]

SESSION_COOKIE_SECURE = ENVIRONMENT != "local"
CSRF_COOKIE_SECURE = ENVIRONMENT != "local"

SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False

SECURE_SSL_REDIRECT = ENVIRONMENT != "local"
SECURE_HSTS_SECONDS = 31536000 if ENVIRONMENT != "local" else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = ENVIRONMENT != "local"
SECURE_HSTS_PRELOAD = ENVIRONMENT != "local"

# ============================
# MEDIA
# ============================
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ============================
# STATIC
# ============================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ============================
# SECURITY
# ============================
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# ============================
# OTHER SETTINGS
# ============================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")

BREVO_API_KEY = config("BREVO_API_KEY", default="")
