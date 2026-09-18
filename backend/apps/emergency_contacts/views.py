from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import EmergencyContact, PersonalICEContact
from .serializers import EmergencyContactSerializer, PersonalICEContactSerializer


class EmergencyContactListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        region = request.query_params.get('region', '').upper()
        service_type = request.query_params.get('service', '').lower()
        contacts = EmergencyContact.objects.filter(verified=True)

        if region:
            contacts = contacts.filter(region__in=[region, 'GLOBAL'])
        if service_type:
            contacts = contacts.filter(service_type=service_type)

        serializer = EmergencyContactSerializer(contacts, many=True)
        return Response({'success': True, 'contacts': serializer.data})


class PersonalICEContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            contacts = PersonalICEContact.objects.filter(user=request.user)
        else:
            contacts = PersonalICEContact.objects.filter(user__isnull=True)
        serializer = PersonalICEContactSerializer(contacts, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        serializer = PersonalICEContactSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save(user=user)
            return Response(PersonalICEContactSerializer(contact).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            if request.user.is_authenticated:
                contact = PersonalICEContact.objects.get(pk=pk, user=request.user)
            else:
                contact = PersonalICEContact.objects.get(pk=pk)
            contact.delete()
            return Response({'message': 'Contact removed'}, status=status.HTTP_204_NO_CONTENT)
        except PersonalICEContact.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
