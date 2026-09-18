import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emergency_assistant.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from rest_framework.test import APIClient

client = APIClient()

print("--- Testing API Endpoints ---")

import time

test_email = f"jane.responder.{int(time.time())}@emergency.org"

# 1. Test Auth Register
reg_resp = client.post('/api/auth/register/', {
    'name': 'Responder Jane Doe',
    'email': test_email,
    'password': 'SecureEmergencyPassword123!',
    'phone': '+1-555-019-2831'
}, format='json')
print(f"1. POST /api/auth/register/ -> Status: {reg_resp.status_code}")
assert reg_resp.status_code == 201, f"Expected 201, got {reg_resp.status_code}: {reg_resp.data}"

# 2. Test Auth Login
login_resp = client.post('/api/auth/login/', {
    'email': test_email,
    'password': 'SecureEmergencyPassword123!'
}, format='json')
print(f"2. POST /api/auth/login/ -> Status: {login_resp.status_code}")
assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}: {login_resp.data}"
token = login_resp.data['access']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

# 3. Test Emergency Analyze
analyze_resp = client.post('/api/emergencies/analyze/', {
    'message': 'Head-on car collision on Highway 101, passenger is bleeding heavily from arm and trapped.',
    'category': 'road_accident',
    'language': 'en'
}, format='json')
print(f"3. POST /api/emergencies/analyze/ -> Status: {analyze_resp.status_code}")
assert analyze_resp.status_code == 200
data = analyze_resp.data
print(f"   Detected Type: {data.get('emergency_type')}")
print(f"   Priority: {data.get('priority')}")
print(f"   Confidence: {data.get('confidence')}")
print(f"   Instructions Count: {len(data.get('immediate_instructions', []))}")

# 4. Test Emergency Create
create_resp = client.post('/api/emergencies/create/', {
    'description': 'Head-on car collision on Highway 101, passenger is bleeding heavily from arm and trapped.',
    'category': 'road_accident',
    'latitude': 40.7128,
    'longitude': -74.0060,
    'ai_response': data
}, format='json')
print(f"4. POST /api/emergencies/create/ -> Status: {create_resp.status_code}")
assert create_resp.status_code == 201
emergency_id = create_resp.data['id']
print(f"   Created Emergency ID: {emergency_id}")

# 5. Test Emergency History
history_resp = client.get('/api/emergencies/history/')
print(f"5. GET /api/emergencies/history/ -> Status: {history_resp.status_code}, Items: {len(history_resp.data)}")
assert history_resp.status_code == 200

# 6. Test Emergency Detail
detail_resp = client.get(f'/api/emergencies/{emergency_id}/')
print(f"6. GET /api/emergencies/{emergency_id}/ -> Status: {detail_resp.status_code}")
assert detail_resp.status_code == 200

# 7. Test Emergency Contacts
contacts_resp = client.get('/api/emergency-contacts/?region=US')
print(f"7. GET /api/emergency-contacts/ -> Status: {contacts_resp.status_code}, Contacts: {len(contacts_resp.data)}")
assert contacts_resp.status_code == 200

# 8. Test Nearby Resources
resources_resp = client.get('/api/nearby-resources/?lat=40.7128&lng=-74.0060')
print(f"8. GET /api/nearby-resources/ -> Status: {resources_resp.status_code}, Count: {resources_resp.data.get('count')}")
assert resources_resp.status_code == 200

# 9. Test AI Chat
chat_resp = client.post('/api/ai/chat/', {
    'messages': [
        {'role': 'user', 'content': 'The passenger has severe arterial bleeding, how do I apply a tourniquet?'}
    ],
    'context': {'emergency_type': 'Road Traffic Accident', 'priority': 'CRITICAL'}
}, format='json')
print(f"9. POST /api/ai/chat/ -> Status: {chat_resp.status_code}")
assert chat_resp.status_code == 200
print(f"   Chat Reply Preview: {chat_resp.data.get('reply')[:80]}...")

# 10. Test Weather
weather_resp = client.get('/api/weather/?lat=40.7128&lng=-74.0060')
print(f"10. GET /api/weather/ -> Status: {weather_resp.status_code}, Condition: {weather_resp.data.get('condition')}")
assert weather_resp.status_code == 200

# 11. Test Translate
translate_resp = client.post('/api/translate/', {
    'text': 'Immediate Safety Instructions',
    'target_language': 'es'
}, format='json')
print(f"11. POST /api/translate/ -> Status: {translate_resp.status_code}, Translated: {translate_resp.data.get('translated_text')}")
assert translate_resp.status_code == 200

print("\nALL 11 BACKEND REST API ENDPOINTS VERIFIED AND PASSING!")
