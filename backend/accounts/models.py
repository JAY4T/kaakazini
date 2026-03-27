from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('craftsman', 'Craftsman'),
        ('admin', 'Admin'),
    )

    # ── Tracks which mode the user is currently browsing in ──────────────
    ACTIVE_ROLE_CHOICES = (
        ('client', 'Client'),
        ('craftsman', 'Craftsman'),
    )

    full_name    = models.CharField(max_length=255)
    email        = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    location     = models.CharField(max_length=100, blank=True)
    subscription = models.CharField(max_length=20, default='free')

    # The role the account was REGISTERED as (permanent)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')

    # ── NEW: The role the user is CURRENTLY acting as (switchable) ───────
    active_role = models.CharField(
        max_length=20,
        choices=ACTIVE_ROLE_CHOICES,
        default='craftsman',
        help_text="The role the user is currently browsing as (can be switched)."
    )

    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.email