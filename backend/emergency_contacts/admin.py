from django.contrib import admin
from .models import EmergencyContact, EmergencyResource


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'service_type', 'phone', 'country', 'region', 'verified')
    search_fields = ('name', 'service_type', 'phone')
    list_filter = ('service_type', 'country', 'verified')


@admin.register(EmergencyResource)
class EmergencyResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'resource_type', 'phone', 'verified')
    search_fields = ('name', 'resource_type', 'address')
    list_filter = ('resource_type', 'verified')
