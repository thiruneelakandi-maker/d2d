from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import EmergencyRequest
from .serializers import EmergencyRequestSerializer, EmergencyCreateSerializer, EmergencyAnalyzeSerializer
from apps.knowledge_base.models import EmergencyKnowledge
from apps.ai_assistant.ai_service import ai_service
from rest_framework import status
from django.db import DatabaseError


KEYWORD_MAP = [
    (['tsunami', 'tidal wave', 'giant wave', 'sea surge'], 'Tsunami'),
    (['building collapse', 'collapsed building', 'structural collapse', 'roof collapse', 'wall collapse'], 'Building Collapse'),
    (['landslide', 'mudslide', 'rockfall', 'slope failure', 'hill collapse'], 'Landslide'),
    (['cyclone', 'hurricane', 'storm surge', 'severe storm', 'thunderstorm', 'strong winds', 'heavy rainstorm'], 'Cyclone / Severe Storm'),
    (['earthquake', 'tremor', 'aftershock', 'shaking ground'], 'Earthquake'),
    (['flood', 'flash flood', 'rising water', 'waterlogged', 'river overflow', 'floodwater', 'storm surge'], 'Flood'),
    (['fire', 'smoke', 'burning', 'blaze', 'flames', 'structure fire'], 'Fire'),
    (['gas leak', 'chemical leak', 'toxic gas', 'gas smell', 'ammonia', 'chlorine', 'hazmat', 'leaking fuel', 'poison gas'], 'Gas or Chemical Leak'),
    (['electrical emergency', 'electrical fire', 'electric shock', 'downed power line', 'sparking wires', 'exposed wire', 'electrocution'], 'Electrical Emergency'),
    (['heart attack', 'chest pain', 'difficulty breathing', 'unconscious', 'bleeding', 'stroke', 'seizure', 'medical emergency', 'injury', 'ambulance'], 'Medical Emergency'),
    (['road accident', 'car crash', 'vehicle collision', 'truck accident', 'motorcycle accident', 'accident', 'crash', 'collision', 'hit by vehicle'], 'Road Accident'),
    (['missing person', 'lost person', 'missing child', 'person missing', 'search and rescue'], 'Missing Person'),
    (['unknown', 'unsure', 'not sure', 'other emergency', 'emergency', 'incident'], 'Other / Unknown Emergency'),
]

DEFAULT_INSTRUCTIONS = {
    'Flood': ['Move to higher ground immediately and avoid flooded roads.', 'Do not walk through floodwater.', 'Call disaster response and emergency services.'],
    'Fire': ['Evacuate immediately and close doors behind you.', 'Use the nearest safe exit and avoid lifts.', 'Notify fire services and keep away from smoke.'],
    'Road Accident': ['Move to a safe area away from traffic.', 'Check for severe injury, bleeding, or trapped passengers.', 'Call ambulance and traffic police.'],
    'Medical Emergency': ['Keep the patient calm and check breathing.', 'Apply pressure to bleed or monitor airway.', 'Call ambulance with clear symptoms.'],
    'Earthquake': ['Drop, cover, and hold on.', 'Move away from damaged buildings and power lines.', 'Check survivors and call rescue teams.'],
    'Cyclone / Severe Storm': ['Move to a sturdy shelter away from windows.', 'Avoid power lines, floodwater, and fallen trees.', 'Follow local emergency alerts.'],
    'Landslide': ['Move away from slopes and unstable ground.', 'Avoid roadways blocked by debris.', 'Report to local disaster response teams.'],
    'Tsunami': ['Move to higher ground immediately.', 'Avoid coastal roads, beaches, and harbors.', 'Evacuate and call emergency services.'],
    'Building Collapse': ['Keep clear of unstable structures.', 'No one should enter damaged debris without rescue support.', 'Alert rescue teams and report trapped victims.'],
    'Missing Person': ['Report the person to local police and family immediately.', 'Check hospitals, shelters, and nearby public places.', 'Share last known location and description.'],
    'Gas or Chemical Leak': ['Move away from the source and do not use switches or flames.', 'Alert hazardous material responders.', 'Stay upwind and keep others away.'],
    'Electrical Emergency': ['Stay away from fallen power lines and wet surfaces.', 'Do not touch electrical equipment in the damaged area.', 'Call utility and fire rescue services.'],
    'Other / Unknown Emergency': ['Keep yourself and others at a safe distance.', 'Call the appropriate emergency service with your exact location.', 'Avoid entering unsafe areas until responders say it is safe.'],
}

SERVICE_MAP = {
    'Flood': 'Disaster Management / Rescue Team',
    'Fire': 'Fire & Rescue Services',
    'Road Accident': 'Traffic Police / Ambulance / Fire Rescue',
    'Medical Emergency': 'Ambulance / Emergency Medical Services',
    'Earthquake': 'Disaster Management / Search and Rescue',
    'Cyclone / Severe Storm': 'Disaster Management / Weather Response Teams',
    'Landslide': 'Disaster Response / Rescue Team',
    'Tsunami': 'Coastal Disaster Management / Rescue Team',
    'Building Collapse': 'Urban Search and Rescue / Fire Service',
    'Missing Person': 'Police / Search and Rescue',
    'Gas or Chemical Leak': 'Fire Rescue / Hazardous Materials Unit',
    'Electrical Emergency': 'Electricity Utility / Fire & Rescue',
    'Other / Unknown Emergency': 'Local Emergency Services / Authorities',
}


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
        category_hint = serializer.validated_data.get('category', '').strip()
        if not message:
            return Response({'success': False, 'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Simple keyword-based classifier
        lower = message.lower()
        detected = 'Other / Unknown Emergency'
        category_selected = False
        if category_hint:
            normalized_category = category_hint.lower()
            normalized_lookup = {
                'fire': 'Fire', 'flood': 'Flood', 'road accident': 'Road Accident', 'road_accident': 'Road Accident', 'accident': 'Road Accident',
                'medical emergency': 'Medical Emergency', 'medical_emergency': 'Medical Emergency', 'medical': 'Medical Emergency',
                'earthquake': 'Earthquake', 'cyclone': 'Cyclone / Severe Storm', 'severe storm': 'Cyclone / Severe Storm',
                'cyclone_storm': 'Cyclone / Severe Storm',
                'landslide': 'Landslide', 'tsunami': 'Tsunami', 'building collapse': 'Building Collapse',
                'building_collapse': 'Building Collapse', 'missing person': 'Missing Person', 'missing_person': 'Missing Person',
                'gas leak': 'Gas or Chemical Leak', 'chemical leak': 'Gas or Chemical Leak', 'gas_chemical_leak': 'Gas or Chemical Leak',
                'gas or chemical leak': 'Gas or Chemical Leak', 'electrical emergency': 'Electrical Emergency',
                'electrical_emergency': 'Electrical Emergency', 'other': 'Other / Unknown Emergency', 'other_unknown': 'Other / Unknown Emergency', 'unknown': 'Other / Unknown Emergency'
            }
            detected = normalized_lookup.get(normalized_category, detected)
            category_selected = detected != 'Other / Unknown Emergency' or normalized_category in {'other', 'other_unknown', 'unknown'}

        if not category_selected:
            for keywords, label in KEYWORD_MAP:
                for kw in keywords:
                    if kw in lower:
                        detected = label
                        break
                if detected != 'Other / Unknown Emergency':
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
            instructions = [m.instruction for m in matches]
        else:
            priority_str = 'High' if detected in {'Fire', 'Flood', 'Earthquake', 'Cyclone / Severe Storm', 'Tsunami', 'Building Collapse', 'Gas or Chemical Leak', 'Electrical Emergency'} else 'Medium'
            recommended = SERVICE_MAP.get(detected, 'Local emergency services')
            instructions = DEFAULT_INSTRUCTIONS.get(detected, DEFAULT_INSTRUCTIONS['Other / Unknown Emergency'])

        return Response({
            'success': True,
            'emergency_type': detected,
            'priority': priority_str,
            'instructions': instructions,
            'recommended_service': recommended
        }, status=status.HTTP_200_OK)


class EmergencyCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = EmergencyCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        description = data['description']
        category = data.get('category', '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        # Recompute analysis on the server so clients cannot submit forged triage data.
        ai_response = ai_service.analyze(description, category_hint=category)

        emergency_type = ai_response.get('emergency_type', category or 'Emergency Incident')
        priority = str(ai_response.get('priority', 'HIGH')).upper()
        if priority not in dict(EmergencyRequest.PRIORITY_CHOICES):
            priority = 'MEDIUM'

        emergency = EmergencyRequest.objects.create(
            user=request.user,
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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        emergencies = EmergencyRequest.objects.filter(user=request.user)[:50]

        serializer = EmergencyRequestSerializer(emergencies, many=True)
        return Response(serializer.data)


class EmergencyDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return EmergencyRequest.objects.get(pk=pk, user=self.request.user)
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
        if new_status not in dict(EmergencyRequest.STATUS_CHOICES):
            return Response({'status': ['A valid emergency status is required.']}, status=status.HTTP_400_BAD_REQUEST)
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
