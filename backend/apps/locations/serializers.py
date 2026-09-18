from rest_framework import serializers
from .models import EmergencyFacility


class EmergencyFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyFacility
        fields = '__all__'
