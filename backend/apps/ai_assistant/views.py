from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .services import analyze_emergency_situation, chat_emergency_copilot
from .ai_service import ai_service
from rest_framework import status
from django.conf import settings
import traceback


class AIAnalyzeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        description = request.data.get('description', '')
        category_hint = request.data.get('category', '')
        if description is None:
            return Response({'error': 'Invalid JSON or missing description'}, status=status.HTTP_400_BAD_REQUEST)

        description = str(description).strip()
        if not description:
            return Response({'error': 'Emergency description is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use ai_service which honors DEMO_MODE and falls back to DB
            result = ai_service.analyze(description, category_hint=str(category_hint or ''))
            # Ensure the structured keys
            payload = {
                'emergency_type': result.get('emergency_type', ''),
                'priority': result.get('priority', ''),
                'instructions': result.get('instructions', []),
                'recommended_service': result.get('recommended_service', ''),
                'from_ai': not getattr(settings, 'DEMO_MODE', True)
            }
            return Response(payload, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': 'Server error processing AI analysis'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIChatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        messages = request.data.get('messages', [])
        context = request.data.get('context', {})

        if not messages:
            return Response(
                {'error': 'Message history is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reply = chat_emergency_copilot(messages, context)
        return Response({
            'reply': reply,
            'role': 'assistant'
        }, status=status.HTTP_200_OK)
