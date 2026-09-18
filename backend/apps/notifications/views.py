from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .services import get_weather_and_disaster_alerts, translate_text


class WeatherAlertView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = request.query_params.get('lat', None)
        lng = request.query_params.get('lng', None)

        try:
            lat = float(lat) if lat is not None else None
            lng = float(lng) if lng is not None else None
        except ValueError:
            lat = None
            lng = None

        weather_data = get_weather_and_disaster_alerts(lat, lng)
        return Response(weather_data)


class TranslateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        text = request.data.get('text', '')
        target_lang = request.data.get('target_language', 'es')

        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

        translated = translate_text(text, target_lang)
        return Response({
            'original_text': text,
            'target_language': target_lang,
            'translated_text': translated
        })
