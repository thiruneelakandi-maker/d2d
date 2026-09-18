from django.db import models
from django.conf import settings


class EmergencyRequest(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_RESOLVED = 'resolved'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='emergency_requests'
    )
    description = models.TextField()
    emergency_type = models.CharField(max_length=150, db_index=True)
    priority = models.IntegerField(default=1, db_index=True)
    ai_response = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Emergency Request'
        verbose_name_plural = 'Emergency Requests'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['emergency_type']),
        ]

    def __str__(self):
        return f"Request {self.id} - {self.emergency_type} ({self.status})"
