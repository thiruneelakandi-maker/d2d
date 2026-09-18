from rest_framework import serializers
from .models import EmergencyRequest
from apps.users.serializers import UserSerializer


class EmergencyRequestSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = EmergencyRequest
        fields = [
            'id', 'user', 'user_detail', 'description', 'emergency_type',
            'priority', 'ai_response', 'latitude', 'longitude',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class EmergencyCreateSerializer(serializers.Serializer):
    description = serializers.CharField(required=True)
    category = serializers.CharField(required=False, allow_blank=True, default='')
    latitude = serializers.FloatField(required=False, allow_null=True, default=None)
    longitude = serializers.FloatField(required=False, allow_null=True, default=None)
    ai_response = serializers.DictField(required=False, default=dict)


class EmergencyAnalyzeSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    category = serializers.CharField(required=False, allow_blank=True, default='')
    language = serializers.CharField(required=False, default='en')
