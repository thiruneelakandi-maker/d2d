from rest_framework import serializers
from .models import EmergencyContact, PersonalICEContact


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = '__all__'


class PersonalICEContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalICEContact
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']
