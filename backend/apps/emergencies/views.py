from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import EmergencyRequest
from .serializers import EmergencyRequestSerializer, EmergencyCreateSerializer, EmergencyAnalyzeSerializer
from apps.knowledge_base.models import EmergencyKnowledge
from rest_framework import status
from rest_framework.exceptions import ParseError
from django.db import DatabaseError


KEYWORD_MAP = [
    (['fire', 'smoke', 'burning'], 'Fire'),
    (['accident', 'crash', 'vehicle'], 'Road Accident'),
    (['injury', 'bleeding', 'unconscious'], 'Medical Emergency'),
    (['flood', 'water rising', 'water'], 'Flood'),
    (['earthquake', 'shaking'], 'Earthquake'),
    (['gas leak', 'gas smell', 'gas'], 'Gas Leak'),
    (['lost', 'missing person', 'missing'], 'Lost Person'),
    (['storm', 'cyclone', 'severe weather'], 'Severe Weather'),
]


PRIORITY_MAP = {
    1: 'High',
    2: 'Medium',
    3: 'Low'
}


class EmergencyAnalyzeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # validate input
        serializer = EmergencyAnalyzeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        message = serializer.validated_data['message'].strip()
        if not message:
            return Response({'success': False, 'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Simple keyword-based classifier
        lower = message.lower()
        detected = 'Other Emergency'
        for keywords, label in KEYWORD_MAP:
            for kw in keywords:
                if kw in lower:
                    detected = label
                    break
            if detected != 'Other Emergency':
                break

        # Search EmergencyKnowledge for verified entries (verification == 'verified')
        try:
            matches = EmergencyKnowledge.objects.filter(emergency_type__iexact=detected, verification__iexact='verified')
        except DatabaseError as e:
            return Response({'success': False, 'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        instructions = [m.instruction for m in matches]

        # Determine priority from first match or default
        if matches.exists():
            first = matches.first()
            try:
                pnum = int(first.priority)
            except Exception:
                pnum = 2
            priority_str = PRIORITY_MAP.get(pnum, 'Medium')
            recommended = first.recommended_service or ''
        else:
            priority_str = 'Medium'
            recommended = ''

        return Response({
            'success': True,
            'emergency_type': detected,
            'priority': priority_str,
            'instructions': instructions,
            'recommended_service': recommended
        }, status=status.HTTP_200_OK)


class EmergencyCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmergencyCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        description = data['description']
        category = data.get('category', '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        ai_response = data.get('ai_response')

        # If analysis was not pre-computed by client, run it now
        if not ai_response or not isinstance(ai_response, dict) or 'priority' not in ai_response:
            ai_response = analyze_emergency_situation(description, category)

        emergency_type = ai_response.get('emergency_type', category or 'Emergency Incident')
        priority = ai_response.get('priority', 'HIGH')

        user = request.user if request.user.is_authenticated else None

        emergency = EmergencyRequest.objects.create(
            user=user,
            description=description,
            emergency_type=emergency_type,
            priority=priority,
            ai_response=ai_response,
            latitude=latitude,
            longitude=longitude,
            status='ACTIVE'
        )

        return Response(
            EmergencyRequestSerializer(emergency).data,
            status=status.HTTP_201_CREATED
        )


class EmergencyHistoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            emergencies = EmergencyRequest.objects.filter(user=request.user)
        else:
            # For public demonstration, return recent emergencies
            emergencies = EmergencyRequest.objects.all()[:20]

        serializer = EmergencyRequestSerializer(emergencies, many=True)
        return Response(serializer.data)


class EmergencyDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        try:
            return EmergencyRequest.objects.get(pk=pk)
        except EmergencyRequest.DoesNotExist:
            return None

    def get(self, request, pk):
        emergency = self.get_object(pk)
        if not emergency:
            return Response({'error': 'Emergency request not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(EmergencyRequestSerializer(emergency).data)

    def patch(self, request, pk):
        emergency = self.get_object(pk)
        if not emergency:
            return Response({'error': 'Emergency request not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status:
            emergency.status = new_status
            emergency.save()

        return Response(EmergencyRequestSerializer(emergency).data)

    def delete(self, request, pk):
        emergency = self.get_object(pk)
        if not emergency:
            return Response({'error': 'Emergency request not found'}, status=status.HTTP_404_NOT_FOUND)
        emergency.delete()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
