from django.db import models


class EmergencyFacility(models.Model):
    FACILITY_TYPES = [
        ('hospital', 'Hospital & Trauma Center'),
        ('police', 'Police Station'),
        ('fire', 'Fire & Rescue Station'),
        ('shelter', 'Evacuation Shelter & Relief Center'),
    ]

    name = models.CharField(max_length=200)
    facility_type = models.CharField(max_length=50, choices=FACILITY_TYPES, db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=300)
    phone = models.CharField(max_length=50)
    is_24_hours = models.BooleanField(default=True)
    emergency_services = models.CharField(max_length=255, default='Emergency Room, Trauma Care')
    bed_status = models.CharField(max_length=50, default='Available')
    rating = models.FloatField(default=4.8)

    def __str__(self):
        return f"{self.name} ({self.facility_type})"
