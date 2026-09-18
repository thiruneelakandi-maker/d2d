import os
import logging
from typing import Dict, Any, List, Optional
from django.conf import settings
from apps.knowledge_base.models import EmergencyKnowledge
from .services import get_openai_client

logger = logging.getLogger(__name__)


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
    'Flood': [
        'Move to higher ground immediately and avoid rivers, drains, and low-lying roads.',
        'Switch off electrical power if safe and do not walk through floodwater.',
        'Call the local disaster response or emergency services and evacuate if water is rising fast.'
    ],
    'Fire': [
        'Evacuate immediately and close doors behind you to slow the spread of smoke and fire.',
        'Do not use lifts; use the nearest safe exit and keep low if smoke is present.',
        'Call the fire brigade and alert nearby people without re-entering the building.'
    ],
    'Road Accident': [
        'Move to a safe position away from traffic and turn on hazard lights if possible.',
        'Check for severe bleeding, unconsciousness, or trapped victims before moving anyone.',
        'Call traffic police and emergency medical services for injured persons.'
    ],
    'Medical Emergency': [
        'Keep the patient calm and check for breathing, pulse, and responsiveness.',
        'Apply first aid to bleeding or chest pain according to the immediate risk level.',
        'Call ambulance or emergency medical services and give clear details about symptoms.'
    ],
    'Earthquake': [
        'Drop, cover, and hold on away from glass, shelves, and exterior walls.',
        'Move away from damaged buildings, power lines, and unstable structures.',
        'Check for trapped people and call disaster rescue teams if the area is unsafe.'
    ],
    'Cyclone / Severe Storm': [
        'Move to a sturdy building or shelter away from windows and exposed open areas.',
        'Secure loose objects and avoid flooded roads, electrical lines, and trees.',
        'Follow local weather alerts and contact disaster services if anyone is trapped.'
    ],
    'Landslide': [
        'Move away from slopes, cliffs, and riverbanks immediately.',
        'Avoid damaged roads or debris-covered areas until rescue teams inspect them.',
        'Report the hazard to local disaster response teams and check for injuries.'
    ],
    'Tsunami': [
        'Move to higher ground immediately and avoid beaches, harbors, and low-lying coastal areas.',
        'Do not wait for visual confirmation; follow official evacuation alerts and sirens.',
        'Call local emergency services and help people evacuate without delay.'
    ],
    'Building Collapse': [
        'Keep a safe distance from the collapsed structure and watch for secondary hazards.',
        'Do not enter unstable debris without trained rescue support.',
        'Call rescue teams and report trapped victims with exact location details.'
    ],
    'Missing Person': [
        'Notify nearby family, neighbors, and local police with a clear description and last known location.',
        'Check hospitals, shelters, and nearby routes where the person may have gone.',
        'Keep a note of the last time they were seen and any contact details.'
    ],
    'Gas or Chemical Leak': [
        'Move away from the source immediately and do not use switches, matches, or mobile phones nearby.',
        'If doors are shut, stay upwind and call hazardous materials or fire rescue services.',
        'Ventilate if safe, but avoid entering the affected area without trained responders.'
    ],
    'Electrical Emergency': [
        'Keep a distance from fallen power lines and wet surfaces.',
        'Switch off the main supply only if it can be done safely from a dry location.',
        'Call electricity utility and fire rescue teams for immediate assistance.'
    ],
    'Other / Unknown Emergency': [
        'Keep yourself and others at a safe distance while you assess the situation.',
        'Call the relevant emergency service and share the exact location and what you can see.',
        'Do not enter unsafe areas until trained responders confirm it is safe.'
    ],
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


PRIORITY_MAP = {1: 'High', 2: 'Medium', 3: 'Low'}


class AIService:
    def __init__(self, timeout: int = 8):
        self.timeout = timeout

    def analyze(self, description: str, category_hint: Optional[str] = None) -> Dict[str, Any]:
        """Main entry: returns structured guidance. Respects DEMO_MODE and falls back safely."""
        desc = (description or '').strip()
        if not desc:
            raise ValueError('description is required')

        demo = getattr(settings, 'DEMO_MODE', True)

        # If not demo mode, attempt OpenAI if key present
        if not demo:
            client = get_openai_client()
            if client:
                try:
                    return self._call_openai(client, desc)
                except Exception as e:
                    logger.exception('OpenAI call failed, falling back to DB: %s', e)

        # Fallback: database-backed verified knowledge
        return self._fallback_from_db(desc, category_hint=category_hint)

    def _call_openai(self, client, description: str) -> Dict[str, Any]:
        """Call OpenAI and parse structured JSON response. Timeout and exceptions handled by caller."""
        # This method is intentionally small to allow easy mocking in tests.
        system_prompt = (
            "You are an AI Emergency Assistant. Provide a compact JSON with keys: emergency_type, priority, instructions (array of strings), recommended_service. "
            "Use verified supplied context when available, never fabricate phone numbers or claim to contact authorities."
        )

        user_content = f"Situation: {description}"

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_content},
            ],
            temperature=0.2,
            response_format={'type': 'json_object'},
            timeout=self.timeout,
        )

        # Expecting a JSON object string in response. Parse defensively.
        raw = response.choices[0].message.content
        import json

        parsed = json.loads(raw)
        # Ensure minimal keys
        return {
            'emergency_type': parsed.get('emergency_type', ''),
            'priority': parsed.get('priority', ''),
            'instructions': parsed.get('instructions', []),
            'recommended_service': parsed.get('recommended_service', ''),
        }

    def _fallback_from_db(self, description: str, category_hint: Optional[str] = None) -> Dict[str, Any]:
        """Use verified EmergencyKnowledge entries to build a response."""
        lower = description.lower()
        detected = 'Other / Unknown Emergency'
        category_selected = False
        if category_hint:
            normalized_hint = category_hint.strip().lower().replace('_', ' ')
            for keywords, label in KEYWORD_MAP:
                if normalized_hint in [kw.lower() for kw in keywords]:
                    detected = label
                    break
            if detected == 'Other / Unknown Emergency':
                alias_map = {
                    'fire': 'Fire',
                    'flood': 'Flood',
                    'road accident': 'Road Accident',
                    'medical emergency': 'Medical Emergency',
                    'earthquake': 'Earthquake',
                    'cyclone': 'Cyclone / Severe Storm',
                    'severe storm': 'Cyclone / Severe Storm',
                    'landslide': 'Landslide',
                    'tsunami': 'Tsunami',
                    'building collapse': 'Building Collapse',
                    'missing person': 'Missing Person',
                    'gas leak': 'Gas or Chemical Leak',
                    'chemical leak': 'Gas or Chemical Leak',
                    'gas or chemical leak': 'Gas or Chemical Leak',
                    'electrical emergency': 'Electrical Emergency',
                    'other': 'Other / Unknown Emergency',
                    'unknown': 'Other / Unknown Emergency',
                }
                detected = alias_map.get(normalized_hint, detected)
            category_selected = detected != 'Other / Unknown Emergency' or normalized_hint in {'other', 'unknown', 'other unknown'}

        if not category_selected:
            for keywords, label in KEYWORD_MAP:
                for kw in keywords:
                    if kw in lower:
                        detected = label
                        break
                if detected != 'Other / Unknown Emergency':
                    break

        # Query verified entries
        matches = EmergencyKnowledge.objects.filter(emergency_type__iexact=detected, verification__iexact='verified')

        instructions = [m.instruction for m in matches]
        if matches.exists():
            first = matches.first()
            try:
                pnum = int(first.priority)
            except Exception:
                pnum = 2
            priority = PRIORITY_MAP.get(pnum, 'Medium')
            recommended = first.recommended_service or ''
        else:
            priority = 'High' if detected in {'Fire', 'Flood', 'Earthquake', 'Cyclone / Severe Storm', 'Tsunami', 'Building Collapse', 'Gas or Chemical Leak', 'Electrical Emergency'} else 'Medium'
            recommended = SERVICE_MAP.get(detected, 'Local emergency services')
            instructions = DEFAULT_INSTRUCTIONS.get(detected, DEFAULT_INSTRUCTIONS['Other / Unknown Emergency'])

        return {
            'emergency_type': detected,
            'priority': priority,
            'instructions': instructions,
            'recommended_service': recommended,
        }


ai_service = AIService()
