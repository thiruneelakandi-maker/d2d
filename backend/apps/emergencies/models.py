import uuid
from django.db import models
from django.conf import settings


class EmergencyRequest(models.Model):
    PRIORITY_CHOICES = [
        ('CRITICAL', 'Critical - Imminent Danger'),
        ('HIGH', 'High - Immediate Assistance Required'),
        ('MEDIUM', 'Medium - Urgent Care'),
        ('LOW', 'Low - Informational / Minor'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active Response'),
        ('IN_PROGRESS', 'In Progress / Dispatched'),
        ('RESOLVED', 'Resolved / Safe'),
        ('ARCHIVED', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='emergencies')
    description = models.TextField()
    emergency_type = models.CharField(max_length=150, default='General Emergency')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='HIGH', db_index=True)
    ai_response = models.JSONField(default=dict, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.emergency_type} [{self.priority}] - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
