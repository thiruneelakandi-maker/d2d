from django.contrib import admin
from .models import EmergencyRequest


@admin.register(EmergencyRequest)
class EmergencyRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'emergency_type', 'priority', 'status', 'created_at')
    search_fields = ('description', 'ai_response')
    list_filter = ('status', 'priority')
