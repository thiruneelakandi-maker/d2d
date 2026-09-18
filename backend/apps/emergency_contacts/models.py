from django.db import models
from django.conf import settings


class EmergencyContact(models.Model):
    SERVICE_CHOICES = [
        ('police', 'Police'),
        ('ambulance', 'Ambulance / Medical EMS'),
        ('fire', 'Fire & Rescue'),
        ('disaster', 'Disaster Management Authority'),
        ('poison', 'Poison Control Center'),
        ('helpline', 'Emergency Response Support System'),
    ]

    REGION_CHOICES = [
        ('GLOBAL', 'International / Universal'),
        ('US', 'United States / Canada'),
        ('IN', 'India'),
        ('UK', 'United Kingdom'),
        ('EU', 'European Union'),
        ('AU', 'Australia'),
    ]

    name = models.CharField(max_length=150)
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES, db_index=True)
    phone = models.CharField(max_length=50, blank=True)
    region = models.CharField(max_length=50, choices=REGION_CHOICES, default='GLOBAL', db_index=True)
    is_primary = models.BooleanField(default=True)
    description = models.CharField(max_length=255, blank=True, default='')
    verified = models.BooleanField(default=False, db_index=True)
    is_demo = models.BooleanField(default=False, db_index=True)

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.region}"


class PersonalICEContact(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ice_contacts', null=True, blank=True)
    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50, default='Family')
    phone = models.CharField(max_length=30)
    notify_on_sos = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.relationship}) - {self.phone}"
