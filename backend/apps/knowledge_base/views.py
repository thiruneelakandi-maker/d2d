from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import EmergencyProtocol
from .serializers import EmergencyProtocolSerializer
from .services import retrieve_relevant_protocols


class ProtocolListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', None)
        query = request.query_params.get('q', None)

        if query:
            protocols = retrieve_relevant_protocols(query, category)
        elif category:
            protocols = EmergencyProtocol.objects.filter(category__icontains=category)
        else:
            protocols = EmergencyProtocol.objects.all()

        serializer = EmergencyProtocolSerializer(protocols, many=True)
        return Response(serializer.data)


class ProtocolDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            protocol = EmergencyProtocol.objects.get(pk=pk)
            return Response(EmergencyProtocolSerializer(protocol).data)
        except EmergencyProtocol.DoesNotExist:
            return Response({'detail': 'Protocol not found'}, status=404)
