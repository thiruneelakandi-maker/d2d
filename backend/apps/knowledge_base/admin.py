from django.contrib import admin
from .models import EmergencyProtocol, EmergencyKnowledge


@admin.register(EmergencyProtocol)
class EmergencyProtocolAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'severity_default', 'created_at')


@admin.register(EmergencyKnowledge)
class EmergencyKnowledgeAdmin(admin.ModelAdmin):
    list_display = ('emergency_type', 'priority', 'recommended_service', 'trusted', 'created_at')
    search_fields = ('emergency_type', 'instruction', 'recommended_service')
    list_filter = ('priority', 'trusted')
