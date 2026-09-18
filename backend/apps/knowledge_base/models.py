from django.db import models


class EmergencyProtocol(models.Model):
    CATEGORY_CHOICES = [
        ('accident', 'Road & Traffic Accident'),
        ('fire', 'Fire & Smoke Inhalation'),
        ('medical', 'Medical Emergency & First Aid'),
        ('flood', 'Flood & Water Hazard'),
        ('earthquake', 'Earthquake & Collapse'),
        ('missing_person', 'Missing Person / Abduction'),
        ('chemical', 'Hazardous Materials & Gas Leak'),
        ('general', 'General Emergency'),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    title = models.CharField(max_length=255)
    severity_default = models.CharField(max_length=20, default='HIGH')
    source_agency = models.CharField(max_length=150, default='WHO / Red Cross / FEMA')
    summary = models.TextField()
    steps = models.JSONField(default=list, help_text="Numbered safety steps")
    dos = models.JSONField(default=list, blank=True, help_text="Recommended immediate actions")
    donts = models.JSONField(default=list, blank=True, help_text="Actions to avoid at all costs")
    keywords = models.TextField(help_text="Keywords used for RAG semantic matching")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"


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
