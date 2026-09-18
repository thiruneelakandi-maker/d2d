from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.knowledge_base.models import EmergencyKnowledge


class EmergencyAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create verified and unverified knowledge
        EmergencyKnowledge.objects.create(
            emergency_type='Fire', priority=1, instruction='Evacuate immediately', recommended_service='Fire Service', verification='verified', trusted=True
        )
        EmergencyKnowledge.objects.create(
            emergency_type='Medical Emergency', priority=2, instruction='Apply pressure to bleeding', recommended_service='Ambulance', verification='unverified', trusted=False
        )

    def test_analyze_fire(self):
        url = reverse('emergency_analyze')
        resp = self.client.post(url, {'message': 'There is a fire and smoke', 'language': 'en'}, format='json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data.get('emergency_type'), 'Fire')
        self.assertIn('Evacuate immediately', data.get('instructions', []))

    def test_analyze_unknown(self):
        url = reverse('emergency_analyze')
        resp = self.client.post(url, {'message': 'Something odd', 'language': 'en'}, format='json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data.get('emergency_type'), 'Other Emergency')
        self.assertEqual(data.get('instructions'), [])

    def test_types_list(self):
        url = reverse('emergency_history')
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (200, 204))