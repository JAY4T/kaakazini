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
ENVIRONMENT = config("ENVIRONMENT", default="local")

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
        default="staging.kaakazini.com,kaakazini.com,www.kaakazini.com"
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
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "djoser",
    "django_rest_passwordreset",
    "django_extensions",
    "storages",
    "accounts",
    "api",
    "services",
    'channels',

]

# ============================
# MIDDLEWARE
# ============================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",   # ← must be first
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
        "NAME":     config("DB_NAME"),
        "USER":     config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST":     config("DB_HOST", default="localhost"),
        "PORT":     config("DB_PORT", default="5432"),
    }
}

# ============================
# AUTHENTICATION
# ============================
AUTH_USER_MODEL = "accounts.CustomUser"
AUTHENTICATION_BACKENDS = ["accounts.authentication.EmailBackend"]

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
IS_LOCAL = ENVIRONMENT == "local"

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":    timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME":   timedelta(days=1),
    "ROTATE_REFRESH_TOKENS":    True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_COOKIE":              "access_token",
    "AUTH_COOKIE_REFRESH":      "refresh_token",
    "AUTH_COOKIE_SECURE":       not IS_LOCAL,   # HTTPS only on staging/prod
    "AUTH_COOKIE_HTTP_ONLY":    True,
    "AUTH_COOKIE_SAMESITE":     "Lax",
}

# ============================
# CORS / CSRF
# ── Only set these ONCE — no duplicate assignments ──
# ============================
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS     = list(default_headers) + ["authorization"]

if IS_LOCAL:
    # ── Local development ──────────────────────────────────────────
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE    = False
    SIMPLE_JWT["AUTH_COOKIE_SECURE"] = False

else:
    # ── Staging / Production ───────────────────────────────────────
    # Build origins only from real domains — exclude localhost and 127.0.0.1
    real_hosts = [
        h.strip() for h in ALLOWED_HOSTS
        if h not in ("localhost", "127.0.0.1", "")
    ]
    CORS_ALLOWED_ORIGINS = [f"https://{h}" for h in real_hosts]
    CSRF_TRUSTED_ORIGINS = [f"https://{h}" for h in real_hosts]
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE    = True

# ── Cookie / session settings (shared) ────────────────────────────
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE    = "Lax"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY    = False   # frontend needs to read this

# ── SSL — let nginx handle redirects, not Django ──────────────────
SECURE_SSL_REDIRECT            = False
SECURE_HSTS_SECONDS            = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD            = False

# ============================
# STORAGE — DigitalOcean Spaces
# ============================
AWS_ACCESS_KEY_ID        = config('DO_SPACES_KEY')
AWS_SECRET_ACCESS_KEY    = config('DO_SPACES_SECRET')
AWS_STORAGE_BUCKET_NAME  = config('DO_SPACES_BUCKET')
AWS_S3_REGION_NAME       = config('DO_SPACES_REGION')
AWS_S3_ENDPOINT_URL      = config('DO_SPACES_ENDPOINT')
AWS_S3_CUSTOM_DOMAIN     = config('DO_SPACES_CUSTOM_DOMAIN')

AWS_DEFAULT_ACL          = 'public-read'
AWS_QUERYSTRING_AUTH     = False
AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}

STORAGES = {
    "default": {
        "BACKEND": "api.storage_backends.MediaStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"

# ============================
# STATIC
# ============================
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ============================
# SECURITY HEADERS
# ============================
SECURE_BROWSER_XSS_FILTER   = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# ============================
# INTERNATIONALISATION
# ============================
LANGUAGE_CODE      = "en-us"
TIME_ZONE          = "Africa/Nairobi"
USE_I18N           = True
USE_TZ             = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ============================
# APP SETTINGS
# ============================
FRONTEND_URL        = config('FRONTEND_URL', default='http://localhost:3000')
BACKEND_URL         = config('BACKEND_URL',  default='http://127.0.0.1:8000')
BREVO_API_KEY       = config('BREVO_API_KEY',       default='')
GOOGLE_MAPS_API_KEY = config('GOOGLE_MAPS_API_KEY', default='')

INTASEND_WALLET_ID  = config('INTASEND_WALLET_ID', default=2, cast=int)