
"""
Django settings for the MUT Hostel Booking Portal (hostel_backend project, api app).
"""
from datetime import timedelta
from pathlib import Path
 
from decouple import Csv, config
 
BASE_DIR = Path(__file__).resolve().parent.parent
 
SECRET_KEY = config("DJANGO_SECRET_KEY", default="change-this-in-production")
DEBUG = config("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="127.0.0.1,localhost", cast=Csv())
 
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
 
    "rest_framework",
    "corsheaders",
    "django_filters",
 
    "api",
]
 
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
 
ROOT_URLCONF = "hostel_backend.urls"
 
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
 
WSGI_APPLICATION = "hostel_backend.wsgi.application"

# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
 
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
 
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
 
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
 
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
 
# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}
 
# ---------------------------------------------------------------------------
# CORS - allow the Vite dev server / production frontend origin
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
    cast=Csv(),
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
    cast=Csv(),
)
 
# ---------------------------------------------------------------------------
# Email (used to send the receipt with the QR code)
# ---------------------------------------------------------------------------
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="MUT Hostel Portal <no-reply@mut.ac.ke>")
 
# ---------------------------------------------------------------------------
# M-Pesa Daraja (Lipa na M-Pesa Online / STK Push)
# ---------------------------------------------------------------------------
MPESA_ENV = config("MPESA_ENV", default="sandbox")  # "sandbox" or "production"
MPESA_CONSUMER_KEY = config("MPESA_CONSUMER_KEY", default="")
MPESA_CONSUMER_SECRET = config("MPESA_CONSUMER_SECRET", default="")
MPESA_SHORTCODE = config("MPESA_SHORTCODE", default="174379")
MPESA_PASSKEY = config("MPESA_PASSKEY", default="")
# Must be a publicly reachable HTTPS URL (e.g. via ngrok in development)
MPESA_CALLBACK_URL = config(
    "MPESA_CALLBACK_URL", default="https://example.com/api/payments/mpesa/callback/"
)
 
# ---------------------------------------------------------------------------
# Bed hold duration - how long a bed stays "pending" while a student pays
# ---------------------------------------------------------------------------
BED_HOLD_DURATION = timedelta(minutes=config("BED_HOLD_MINUTES", default=10, cast=int))
 
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "api": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
    },
}