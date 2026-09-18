from django.contrib import admin
from .models import EmergencyKnowledge


@admin.register(EmergencyKnowledge)
class EmergencyKnowledgeAdmin(admin.ModelAdmin):
    list_display = ('emergency_type', 'priority', 'recommended_service', 'created_at')
    search_fields = ('emergency_type', 'instruction', 'recommended_service')
    list_filter = ('priority',)
