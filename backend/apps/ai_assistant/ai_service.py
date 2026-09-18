import os
import logging
from typing import Dict, Any, List, Optional
from django.conf import settings
from apps.knowledge_base.models import EmergencyKnowledge
from .services import get_openai_client

logger = logging.getLogger(__name__)


KEYWORD_MAP = [
    (['fire', 'smoke', 'burning'], 'Fire'),
    (['accident', 'crash', 'vehicle'], 'Road Accident'),
    (['injury', 'bleeding', 'unconscious'], 'Medical Emergency'),
    (['flood', 'water rising', 'water'], 'Flood'),
    (['earthquake', 'shaking'], 'Earthquake'),
    (['gas leak', 'gas smell', 'gas'], 'Gas Leak'),
    (['lost', 'missing person', 'missing'], 'Lost Person'),
    (['storm', 'cyclone', 'severe weather'], 'Severe Weather'),
]


PRIORITY_MAP = {1: 'High', 2: 'Medium', 3: 'Low'}


class AIService:
    def __init__(self, timeout: int = 8):
        self.timeout = timeout

    def analyze(self, description: str) -> Dict[str, Any]:
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
        return self._fallback_from_db(desc)

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

    def _fallback_from_db(self, description: str) -> Dict[str, Any]:
        """Use verified EmergencyKnowledge entries to build a response."""
        lower = description.lower()
        detected = 'Other Emergency'
        for keywords, label in KEYWORD_MAP:
            for kw in keywords:
                if kw in lower:
                    detected = label
                    break
            if detected != 'Other Emergency':
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
            priority = 'Medium'
            recommended = ''

        return {
            'emergency_type': detected,
            'priority': priority,
            'instructions': instructions,
            'recommended_service': recommended,
        }


ai_service = AIService()
