from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'preferred_language', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'preferred_language', 'phone']

    def create(self, validated_data):
        email = validated_data.get('email', '').strip().lower()
        name = validated_data.get('name', '').strip()
        username = email.split('@')[0] + '_' + str(User.objects.count() + 1)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            name=name,
            preferred_language=validated_data.get('preferred_language', 'en'),
            phone=validated_data.get('phone', '')
        )
        return user
