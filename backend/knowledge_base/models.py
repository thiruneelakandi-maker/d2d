from django.db import models


class EmergencyKnowledge(models.Model):
    emergency_type = models.CharField(max_length=150, db_index=True)
    priority = models.IntegerField(default=1, db_index=True)
    instruction = models.TextField()
    recommended_service = models.CharField(max_length=150, blank=True)
    verification = models.CharField(max_length=255, blank=True)
    trusted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Emergency Knowledge'
        verbose_name_plural = 'Emergency Knowledge'
        indexes = [
            models.Index(fields=['emergency_type']),
            models.Index(fields=['priority']),
        ]
        unique_together = (('emergency_type', 'instruction'),)

    def __str__(self):
        return f"{self.emergency_type} (priority={self.priority})"
