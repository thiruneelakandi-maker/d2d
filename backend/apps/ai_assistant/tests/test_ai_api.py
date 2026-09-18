from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from apps.knowledge_base.models import EmergencyKnowledge
from unittest.mock import patch


class AIApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @override_settings(DEMO_MODE=True)
    def test_ai_analyze_identifies_multiple_emergency_types(self):
        EmergencyKnowledge.objects.create(
            emergency_type='Flood', priority=1, instruction='Move to higher ground immediately', recommended_service='Disaster Management', verification='verified', trusted=True
        )
        EmergencyKnowledge.objects.create(
            emergency_type='Medical Emergency', priority=1, instruction='Call ambulance and provide first aid', recommended_service='Ambulance', verification='verified', trusted=True
        )

        flood_resp = self.client.post('/api/ai/analyze/', {'description': 'Water is rising rapidly and roads are flooding near the river'}, format='json')
        self.assertEqual(flood_resp.status_code, 200)
        self.assertEqual(flood_resp.json()['emergency_type'], 'Flood')

        medical_resp = self.client.post('/api/ai/analyze/', {'description': 'A person is having chest pain and difficulty breathing'}, format='json')
        self.assertEqual(medical_resp.status_code, 200)
        self.assertEqual(medical_resp.json()['emergency_type'], 'Medical Emergency')

    @override_settings(DEMO_MODE=True)
    def test_ai_analyze_demo_mode_uses_db(self):
        EmergencyKnowledge.objects.create(
            emergency_type='Fire', priority=1, instruction='Evacuate immediately', recommended_service='Fire Service', verification='verified', trusted=True
        )
        resp = self.client.post('/api/ai/analyze/', {'description': 'There is a fire and smoke in the building'}, format='json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['emergency_type'], 'Fire')
        self.assertIn('Evacuate immediately', data['instructions'])

    @override_settings(DEMO_MODE=False)
    @override_settings(DEMO_MODE=False)
    @patch('apps.ai_assistant.ai_service.get_openai_client')
    @patch('apps.ai_assistant.ai_service.AIService._call_openai')
    def test_ai_analyze_uses_openai_when_not_demo(self, mock_openai, mock_get_client):
        mock_openai.return_value = {
            'emergency_type': 'Fire',
            'priority': 'High',
            'instructions': ['Evacuate and call fire department'],
            'recommended_service': 'Fire Service'
        }
        mock_get_client.return_value = object()
        resp = self.client.post('/api/ai/analyze/', {'description': 'There is a fire and smoke in the building'}, format='json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['emergency_type'], 'Fire')
        self.assertIn('Evacuate and call fire department', data['instructions'])