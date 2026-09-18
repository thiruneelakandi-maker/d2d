from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .services import get_nearby_resources
from .weather_service import get_weather as get_weather_service
from rest_framework import status


class NearbyResourcesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = request.query_params.get('lat', None)
        lng = request.query_params.get('lng', None)
        facility_type = request.query_params.get('type', None)

        try:
            lat = float(lat) if lat is not None else None
            lng = float(lng) if lng is not None else None
        except ValueError:
            lat = None
            lng = None

        resources = get_nearby_resources(lat, lng, facility_type)
        return Response({
            "count": len(resources),
            "user_coordinates": {"lat": lat, "lng": lng} if lat and lng else None,
            "results": resources
        })

    def post(self, request):
        # Accept JSON payload { latitude, longitude, radius, facility_type }
        payload = request.data or {}
        try:
            lat = float(payload.get('latitude')) if payload.get('latitude') is not None else None
            lng = float(payload.get('longitude')) if payload.get('longitude') is not None else None
        except (TypeError, ValueError):
            return Response({'success': False, 'error': 'Invalid latitude/longitude'}, status=400)

        facility_type = payload.get('facility_type') or payload.get('type') or None
        # radius is currently unused by the service but accepted for future use
        radius = payload.get('radius', None)

        resources = get_nearby_resources(lat, lng, facility_type)
        return Response({'success': True, 'count': len(resources), 'results': resources})


class WeatherView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Accept query params 'latitude' or 'lat', and 'longitude' or 'lng'
        lat = request.query_params.get('latitude') or request.query_params.get('lat')
        lng = request.query_params.get('longitude') or request.query_params.get('lng')

        try:
            lat_val = float(lat) if lat is not None else None
            lng_val = float(lng) if lng is not None else None
        except (TypeError, ValueError):
            return Response({'error': 'Invalid latitude/longitude'}, status=status.HTTP_400_BAD_REQUEST)

        weather = get_weather_service(lat_val, lng_val)
        # Ensure minimal structure is always returned
        base = {
            'temperature': weather.get('temperature'),
            'condition': weather.get('condition'),
            'alert': weather.get('alert'),
        }
        # Merge additional metadata when available
        base.update({
            'weather_code': weather.get('weather_code', 0),
            'wind_speed_kmh': weather.get('wind_speed_kmh', 0),
            'precipitation_mm': weather.get('precipitation_mm', 0),
            'severity': weather.get('severity', 'normal'),
            'has_alert': weather.get('has_alert', False),
            'source': weather.get('source', 'unknown'),
        })

        return Response(base)
