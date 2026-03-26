from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import CustomUser
from decimal import Decimal
from datetime import timedelta
import requests

from django.utils.text import slugify
from django.conf import settings
import uuid


User = get_user_model()

PRIMARY_SERVICE_CHOICES = [
    ('Plumbing', 'Plumbing'),
    ('Electrical', 'Electrical'),
    ('Carpentry', 'Carpentry'),
    ('Painting', 'Painting'),
    ('Roofing', 'Roofing'),
    ('Welding', 'Welding'),
    ('Tiling', 'Tiling'),
    ('Interior Design', 'Interior Design'),
    ('Landscaping', 'Landscaping'),
    ('Masonry', 'Masonry'),
    ('AC Repair', 'AC Repair'),
    ('Woodwork', 'Woodwork'),
    ('Auto Repair', 'Auto Repair'),
]

RATE_UNIT_CHOICES = [
    ('fixed', 'Fixed Price'),
    ('hour', 'Per Hour'),
    ('day', 'Per Day'),
    ('sqm', 'Per m²'),
]

EXPERIENCE_LEVEL_CHOICES = [
    ('1-2 years', '1-2 years'),
    ('3-5 years', '3-5 years'),
    ('5-10 years', '5-10 years'),
    ('10+ years', '10+ years'),
]


class Craftsman(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user         = models.OneToOneField(User, on_delete=models.CASCADE)
    profile      = models.ImageField(upload_to='profiles/', blank=True, null=True)
    full_name    = models.CharField(max_length=255, blank=True, null=True)
    profession   = models.CharField(max_length=100, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    member_since = models.DateField(null=True, blank=True)
    location     = models.CharField(max_length=255, blank=True, null=True)

    # Skills stored as comma-separated string; API layer converts ↔ list
    skills = models.TextField(blank=True, null=True)

    experience_level = models.CharField(
        max_length=50, choices=EXPERIENCE_LEVEL_CHOICES, blank=True, null=True
    )

    proof_document = models.FileField(upload_to='proof_documents/', blank=True, null=True)

    primary_service = models.CharField(
        max_length=255, choices=PRIMARY_SERVICE_CHOICES, blank=True, null=True
    )
    video         = models.URLField(blank=True, null=True)
    service_image = models.ImageField(upload_to='services/', blank=True, null=True)
    description   = models.TextField(default="No description provided")

    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_approved = models.BooleanField(default=False)
    is_active   = models.BooleanField(default=True)

    account_type = models.CharField(
        max_length=20,
        choices=[('Individual', 'Individual'), ('Company', 'Company')],
        default='Individual',
    )

    # ── Payment wallet ────────────────────────────────────────────────────────
    # Set automatically when craftsman first saves their profile.
    # The ID comes from the jay4t.org gateway (POST /api/v1/intasend/wallet).
    # Used as walletId in every STK push so money goes to this craftsman.
    wallet_id = models.IntegerField(
        null=True, blank=True,
        help_text="jay4t.org gateway wallet ID — set at first profile save"
    )
    # ─────────────────────────────────────────────────────────────────────────

    slug = models.SlugField(unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.user.full_name:
            self.slug = slugify(self.user.full_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name or str(self.user)


class Service(models.Model):
    craftsman = models.ForeignKey(
        Craftsman, on_delete=models.CASCADE, related_name='services'
    )
    service_name = models.CharField(
        max_length=255, choices=PRIMARY_SERVICE_CHOICES, blank=True, null=True
    )
    custom_name = models.CharField(
        max_length=255, blank=True, null=True,
        help_text='Free-text name when not in the standard choices list',
    )
    rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    unit = models.CharField(
        max_length=20, choices=RATE_UNIT_CHOICES, default='fixed', blank=True, null=True
    )
    image      = models.ImageField(upload_to='services/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    custom_service_name = models.CharField(max_length=255, blank=True, null=True)

    def get_display_name(self):
        return self.custom_name or self.custom_service_name or self.service_name or ''

    def __str__(self):
        return self.get_display_name()


class ServiceVideo(models.Model):
    craftsman = models.ForeignKey(Craftsman, related_name='service_videos', on_delete=models.CASCADE)
    video = models.FileField(upload_to='craftsmen/service_videos/')

    def __str__(self):
        return f"ServiceVideo for {self.craftsman.full_name}"


class Product(models.Model):
    craftsman   = models.ForeignKey(Craftsman, on_delete=models.CASCADE)
    name        = models.CharField(max_length=100, default='Unnamed Product')
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(default="No description provided")
    image       = models.ImageField(upload_to='products/', null=True, blank=True)
    status      = models.CharField(max_length=20, default='pending')
    is_approved = models.BooleanField(default=False)


class GalleryImage(models.Model):
    craftsman = models.ForeignKey(
        Craftsman, related_name='gallery_images', on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='craftsmen/gallery/')

    def __str__(self):
        return f"GalleryImage #{self.pk} for {self.craftsman}"


class Review(models.Model):
    craftsman = models.ForeignKey(Craftsman, related_name='reviews', on_delete=models.CASCADE)
    reviewer  = models.CharField(max_length=255)
    location  = models.CharField(max_length=255, blank=True, null=True)
    rating    = models.IntegerField()
    comment   = models.TextField()

    def __str__(self):
        return f"Review by {self.reviewer} for {self.craftsman.full_name}"


class JobRequest(models.Model):

    STATUS_PENDING        = 'Pending'
    STATUS_ASSIGNED       = 'Assigned'
    STATUS_ACCEPTED       = 'Accepted'
    STATUS_IN_PROGRESS    = 'In Progress'
    STATUS_COMPLETED      = 'Completed'
    STATUS_QUOTE_SUBMITTED = 'Quote Submitted'
    STATUS_QUOTE_APPROVED  = 'Quote Approved'
    STATUS_APPROVED       = 'Approved'
    STATUS_PAID           = 'Paid'
    STATUS_CANCELLED      = 'Cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING,         'Pending'),
        (STATUS_ASSIGNED,        'Assigned'),
        (STATUS_ACCEPTED,        'Accepted'),
        (STATUS_IN_PROGRESS,     'In Progress'),
        (STATUS_QUOTE_SUBMITTED, 'Quote Submitted'),
        (STATUS_QUOTE_APPROVED,  'Quote Approved'),
        (STATUS_COMPLETED,       'Completed'),
        (STATUS_APPROVED,        'Approved'),
        (STATUS_PAID,            'Paid'),
        (STATUS_CANCELLED,       'Cancelled'),
    ]

    client    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    craftsman = models.ForeignKey(
        Craftsman, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs'
    )

    name           = models.CharField(max_length=100)
    phone          = models.CharField(max_length=20)
    service        = models.CharField(max_length=50, choices=PRIMARY_SERVICE_CHOICES)
    custom_service = models.CharField(max_length=255, blank=True, null=True)
    schedule       = models.DateTimeField()
    address        = models.CharField(max_length=255)
    location       = models.CharField(max_length=100)
    isUrgent       = models.BooleanField(default=False)
    description    = models.TextField(default="No description provided")
    media          = models.FileField(upload_to='uploads/', blank=True, null=True)

    budget          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    distance_km     = models.DecimalField(max_digits=7,  decimal_places=2, null=True, blank=True)
    start_time      = models.DateTimeField(null=True, blank=True)
    end_time        = models.DateTimeField(null=True, blank=True)
    duration_hours  = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    expected_end    = models.DateTimeField(null=True, blank=True)
    overtime_hours  = models.DecimalField(max_digits=5,  decimal_places=2, default=Decimal('0.0'))
    total_payment   = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.0'))
    company_fee     = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.0'))
    net_payment     = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.0'))
    quote_details   = models.JSONField(blank=True, null=True)
    quote_file      = models.FileField(upload_to='quotes/', null=True, blank=True)
    quote_approved_by_client = models.BooleanField(null=True, blank=True)
    intasend_invoice_id = models.CharField(max_length=100, blank=True, default="")

    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    review     = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    GOOGLE_MAPS_API_KEY      = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
    DEFAULT_JOB_DURATION_HOURS = 2
    COMPANY_FEE_PERCENT      = Decimal('10.0')

    def calculate_distance(self):
        if not self.location or not self.address:
            return None
        try:
            url = (
                f"https://maps.googleapis.com/maps/api/distancematrix/json"
                f"?origins={self.address}&destinations={self.location}&key={self.GOOGLE_MAPS_API_KEY}"
            )
            response = requests.get(url).json()
            distance_m = response['rows'][0]['elements'][0]['distance']['value']
            return Decimal(distance_m / 1000).quantize(Decimal('0.01'))
        except Exception:
            return None

    def save(self, *args, **kwargs):
        if not self.expected_end and self.schedule:
            self.expected_end = self.schedule + timedelta(hours=self.DEFAULT_JOB_DURATION_HOURS)

        new_distance = self.calculate_distance()
        if new_distance:
            self.distance_km = new_distance

        if self.start_time and self.end_time:
            diff_hours = (self.end_time - self.start_time).total_seconds() / 3600
            self.duration_hours = Decimal(diff_hours).quantize(Decimal('0.01'))
            if self.expected_end:
                overtime = max((self.end_time - self.expected_end).total_seconds() / 3600, 0)
                self.overtime_hours = Decimal(overtime).quantize(Decimal('0.01'))
            else:
                self.overtime_hours = Decimal('0.0')

        if self.budget is not None:
            self.total_payment = (self.budget + self.overtime_hours).quantize(Decimal('0.01'))
            self.company_fee   = (self.total_payment * self.COMPANY_FEE_PERCENT / 100).quantize(Decimal('0.01'))
            self.net_payment   = (self.total_payment - self.company_fee).quantize(Decimal('0.01'))

        super().save(*args, **kwargs)

    def __str__(self):
        label = dict(PRIMARY_SERVICE_CHOICES).get(self.service, self.service)
        if self.service == 'other' and self.custom_service:
            label = self.custom_service
        return f"{label} for {self.name} ({self.status})"


class JobProofImage(models.Model):
    job         = models.ForeignKey(JobRequest, related_name='proof_images', on_delete=models.CASCADE)
    image       = models.ImageField(upload_to='job_proofs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proof for Job {self.job.id}"


class ContactMessage(models.Model):
    name       = models.CharField(max_length=255, blank=True, default='')
    email      = models.EmailField(blank=True, default='')
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


TEAM_ROLE_CHOICES = [
    ('helper',  'Helper'),
    ('foreman', 'Foreman'),
    ('partner', 'Partner'),
]

INVITE_METHOD_CHOICES = [
    ('email',    'Email'),
    ('sms',      'SMS'),
    ('whatsapp', 'WhatsApp'),
    ('link',     'Link'),
]


class TeamInvite(models.Model):
    STATUS_CHOICES = [
        ('pending_invite',   'Invite Sent'),
        ('pending_approval', 'Awaiting Approval'),
        ('accepted',         'Accepted'),
        ('rejected',         'Rejected'),
        ('declined',         'Declined'),
        ('revoked',          'Revoked'),
    ]

    craftsman  = models.ForeignKey('Craftsman', on_delete=models.CASCADE, related_name='team_invites')
    name       = models.CharField(max_length=255, blank=True, null=True)
    contact    = models.CharField(max_length=255, blank=True, null=True,
                                  help_text='Email address or phone number')
    method     = models.CharField(max_length=20, choices=INVITE_METHOD_CHOICES, default='email')
    role       = models.CharField(max_length=20, choices=TEAM_ROLE_CHOICES, default='helper')
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status     = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_invite')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Invite → {self.contact} ({self.role}) by {self.craftsman}"


class CraftsmanMember(models.Model):
    STATUS_CHOICES = [
        ('pending_approval', 'Awaiting Approval'),
        ('accepted',         'Active'),
        ('rejected',         'Rejected'),
    ]

    craftsman = models.ForeignKey('Craftsman', on_delete=models.CASCADE, related_name='team_members')
    user      = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='craftsman_memberships',
        null=True, blank=True
    )
    invite    = models.OneToOneField(
        TeamInvite, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='member'
    )
    full_name = models.CharField(max_length=255, blank=True, null=True)
    email     = models.EmailField(blank=True, null=True)
    phone     = models.CharField(max_length=30, blank=True, null=True)
    role      = models.CharField(max_length=20, choices=TEAM_ROLE_CHOICES, default='helper')
    status    = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_approval')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-joined_at']
        unique_together = [('craftsman', 'user')]

    def __str__(self):
        return f"{self.full_name} ({self.role}) — {self.craftsman}"