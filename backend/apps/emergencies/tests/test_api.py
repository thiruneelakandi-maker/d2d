from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.knowledge_base.models import EmergencyKnowledge
from apps.users.models import User
from apps.emergencies.models import EmergencyRequest


class EmergencyAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='sprint1@example.com', email='sprint1@example.com', password='Secret123!', name='Sprint Tester')
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

    def test_analyze_flood_and_medical(self):
        url = reverse('emergency_analyze')

        flood_resp = self.client.post(url, {'message': 'Floodwater is rising and families are trapped in the neighborhood', 'language': 'en'}, format='json')
        self.assertEqual(flood_resp.status_code, 200)
        self.assertEqual(flood_resp.json().get('emergency_type'), 'Flood')

        medical_resp = self.client.post(url, {'message': 'A patient is unconscious and bleeding heavily after an accident', 'language': 'en'}, format='json')
        self.assertEqual(medical_resp.status_code, 200)
        self.assertEqual(medical_resp.json().get('emergency_type'), 'Medical Emergency')

    def test_selected_category_overrides_ambiguous_keywords(self):
        url = reverse('emergency_analyze')
        resp = self.client.post(url, {
            'message': 'Head-on collision with a passenger bleeding heavily and trapped in the car',
            'category': 'road_accident',
            'language': 'en',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get('emergency_type'), 'Road Accident')

    def test_analyze_unknown(self):
        url = reverse('emergency_analyze')
        resp = self.client.post(url, {'message': 'Something odd', 'language': 'en'}, format='json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data.get('emergency_type'), 'Other / Unknown Emergency')
        self.assertTrue(len(data.get('instructions', [])) > 0)

    def test_types_list(self):
        url = reverse('emergency_history')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 401)

    def test_create_requires_authentication_and_server_recomputes_analysis(self):
        url = reverse('emergency_create')
        payload = {
            'description': 'Rapid floodwater is entering the home',
            'category': 'flood',
            'latitude': 12.3,
            'longitude': 45.6,
            'ai_response': {'emergency_type': 'Fire', 'priority': 'LOW'},
        }
        self.assertEqual(self.client.post(url, payload, format='json').status_code, 401)

        self.client.force_authenticate(self.user)
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['emergency_type'], 'Flood')
        self.assertEqual(resp.json()['priority'], 'HIGH')

    def test_history_and_detail_are_limited_to_owner(self):
        other = User.objects.create_user(username='other@example.com', email='other@example.com', password='Secret123!', name='Other User')
        emergency = EmergencyRequest.objects.create(user=other, description='Private report', emergency_type='Fire')
        self.client.force_authenticate(self.user)

        history = self.client.get(reverse('emergency_history'))
        self.assertEqual(history.status_code, 200)
        self.assertEqual(history.json(), [])
        detail = self.client.get(reverse('emergency_detail', kwargs={'pk': emergency.pk}))
        self.assertEqual(detail.status_code, 404)

    def test_status_update_rejects_invalid_value(self):
        emergency = EmergencyRequest.objects.create(user=self.user, description='Flood report', emergency_type='Flood')
        self.client.force_authenticate(self.user)
        resp = self.client.patch(reverse('emergency_detail', kwargs={'pk': emergency.pk}), {'status': 'NOT_A_STATUS'}, format='json')
        self.assertEqual(resp.status_code, 400)