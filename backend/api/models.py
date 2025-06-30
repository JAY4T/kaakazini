from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import CustomUser


User = get_user_model()

# Reusable service choices
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


class Craftsman(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    profile = models.ImageField(upload_to='profiles/', blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    member_since = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    primary_service = models.CharField(
        max_length=255, choices=PRIMARY_SERVICE_CHOICES, blank=True, null=True
    )
    service_image = models.ImageField(upload_to='services/images/', blank=True, null=True)
    video = models.URLField(blank=True, null=True)  # YouTube or Vimeo
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.full_name


class Service(models.Model):
    craftsman = models.ForeignKey(Craftsman, on_delete=models.CASCADE, related_name='services')
    service_name = models.CharField(max_length=255, choices=PRIMARY_SERVICE_CHOICES)
    custom_service_name = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='services/')
    is_approved = models.BooleanField(default=False)  


class Product(models.Model):
    craftsman = models.ForeignKey(Craftsman, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='Unnamed Product')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    is_approved = models.BooleanField(default=False)


class GalleryImage(models.Model):
    craftsman = models.ForeignKey(Craftsman, related_name='gallery_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='craftsmen/gallery/')


class Review(models.Model):
    craftsman = models.ForeignKey(Craftsman, related_name='reviews', on_delete=models.CASCADE)
    reviewer = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    rating = models.IntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"Review by {self.reviewer} for {self.craftsman.full_name}"


# class Client(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     phone = models.CharField(max_length=20)

#     def __str__(self):
#         return f"{self.user.first_name} {self.user.last_name}"


class JobRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    service = models.CharField(max_length=50, choices=PRIMARY_SERVICE_CHOICES)
    custom_service = models.CharField(max_length=255, blank=True, null=True)
    schedule = models.DateTimeField()
    address = models.CharField(max_length=255)
    location = models.CharField(max_length=100)
    description = models.TextField()
    isUrgent = models.BooleanField(default=False)
    media = models.FileField(upload_to='uploads/', blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    review = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        label = dict(PRIMARY_SERVICE_CHOICES).get(self.service, self.service)
        if self.service == 'other' and self.custom_service:
            label = self.custom_service
        return f"{label} for {self.name} ({self.status})"


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

