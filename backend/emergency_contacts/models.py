from django.db import models


class EmergencyContact(models.Model):
    name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=150, db_index=True)
    phone = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    region = models.CharField(max_length=100, blank=True, db_index=True)
    verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Emergency Contact'
        verbose_name_plural = 'Emergency Contacts'
        indexes = [
            models.Index(fields=['service_type']),
            models.Index(fields=['country', 'region']),
        ]

    def __str__(self):
        return f"{self.name} ({self.service_type})"


class EmergencyResource(models.Model):
    name = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=150, db_index=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Emergency Resource'
        verbose_name_plural = 'Emergency Resources'
        indexes = [
            models.Index(fields=['resource_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.resource_type})"
