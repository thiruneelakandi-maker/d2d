from rest_framework import serializers
from .models import EmergencyProtocol


class EmergencyProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyProtocol
        fields = '__all__'
