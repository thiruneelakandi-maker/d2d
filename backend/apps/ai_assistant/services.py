import json
import os
import re
from typing import Dict, Any, List
from django.conf import settings
from apps.knowledge_base.services import retrieve_relevant_protocols, format_rag_context


def get_openai_client():
    api_key = getattr(settings, 'OPENAI_API_KEY', '') or os.getenv('OPENAI_API_KEY', '')
    if api_key and api_key.strip():
        try:
            from openai import OpenAI
            return OpenAI(api_key=api_key.strip())
        except Exception as e:
            print(f"Failed to initialize OpenAI client: {e}")
    return None


def calculate_rule_based_priority(text: str, category: str = '') -> tuple[str, float]:
    """Classifies priority level and confidence score based on clinical/safety urgency indicators."""
    lower = text.lower()
    cat = (category or '').lower()

    critical_keywords = [
        'unconscious', 'not breathing', 'stopped breathing', 'cardiac arrest', 'severe bleeding',
        'arterial bleed', 'trapped in fire', 'heavy smoke', 'chest pain', 'choking', 'gunshot',
        'stab wound', 'amputation', 'drowning', 'explosion', 'building collapse', 'stroke'
    ]
    high_keywords = [
        'bleeding', 'fracture', 'broken bone', 'burn', 'fire', 'crash', 'collision',
        'head injury', 'deep cut', 'flood rising', 'gas smell', 'leak', 'asthma attack',
        'seizure', 'electric shock', 'overdose', 'poison', 'missing child'
    ]
    medium_keywords = [
        'sprain', 'minor cut', 'dizzy', 'fever', 'smoke in distance', 'stranded',
        'power outage', 'missing adult', 'water leak', 'fallen tree', 'property damage'
    ]

    for kw in critical_keywords:
        if kw in lower:
            return 'CRITICAL', 0.96

    if 'accident' in cat or 'fire' in cat:
        return 'HIGH', 0.92

    for kw in high_keywords:
        if kw in lower:
            return 'HIGH', 0.90

    for kw in medium_keywords:
        if kw in lower:
            return 'MEDIUM', 0.85

    return 'LOW', 0.78


def analyze_emergency_situation(description: str, category_hint: str = None) -> Dict[str, Any]:
    """
    RAG-grounded Emergency Analysis & Triage Engine.
    1. Retrieves verified official protocols from knowledge base (RAG).
    2. Uses OpenAI GPT if API key is present.
    3. Seamlessly falls back to verified RAG emergency rules if key is not available.
    """
    retrieved_protocols = retrieve_relevant_protocols(description, category_hint, top_k=2)
    rag_context = format_rag_context(retrieved_protocols)

    client = get_openai_client()
    if client:
        try:
            system_prompt = (
                "You are an expert AI Emergency Triage Dispatcher. Your job is to analyze the user's emergency situation, "
                "classify its severity and type, and provide immediate life-safety instructions grounded in official protocols.\n\n"
                "IMPORTANT SAFETY RULES:\n"
                "1. DO NOT replace professional emergency services. Always advise calling 911 / 112 immediately.\n"
                "2. Provide numbered, concise, action-first steps (e.g. '1. Ensure scene safety. 2. Apply firm direct pressure.').\n"
                "3. Provide critical Do's and Don'ts.\n\n"
                f"VERIFIED EMERGENCY REFERENCE PROTOCOLS (RAG):\n{rag_context}\n\n"
                "Return ONLY a valid JSON object with the following keys:\n"
                "- emergency_type: (string, specific and clear, e.g. 'Road Traffic Accident with Hemorrhage')\n"
                "- priority: (string: 'CRITICAL', 'HIGH', 'MEDIUM', or 'LOW')\n"
                "- confidence: (float between 0.80 and 0.99)\n"
                "- summary: (string, 1-2 sentences summarizing situation assessment)\n"
                "- immediate_instructions: (list of dicts, each with 'step' (int), 'title' (short string), 'instruction' (detailed instruction), 'urgency' ('critical'|'important'|'caution'))\n"
                "- dos: (list of short actionable tips)\n"
                "- donts: (list of critical actions to avoid)\n"
                "- official_services_recommended: (list of services e.g. ['Ambulance / EMS', 'Police Dispatch', 'Fire & Rescue'])\n"
                "- emergency_disclaimer: (string: official disclaimer notice)\n"
            )

            user_content = f"User Reported Situation: {description}\nCategory Hint: {category_hint or 'Not specified'}"

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )

            result_content = response.choices[0].message.content
            parsed = json.loads(result_content)
            parsed["rag_grounded"] = True
            parsed["source_protocols"] = [p.title for p in retrieved_protocols]
            return parsed
        except Exception as e:
            print(f"OpenAI analysis call failed, falling back to local RAG triage: {e}")

    # Fallback to local RAG triage engine
    priority, confidence = calculate_rule_based_priority(description, category_hint)

    # Determine emergency type title
    type_name = category_hint.title() if category_hint and category_hint.lower() != 'other' else "Emergency Incident"
    desc_lower = description.lower()
    if 'crash' in desc_lower or 'car' in desc_lower or 'accident' in desc_lower or 'vehicle' in desc_lower:
        type_name = "Road Traffic Accident"
    elif 'fire' in desc_lower or 'smoke' in desc_lower or 'flame' in desc_lower:
        type_name = "Fire & Smoke Hazard"
    elif 'breath' in desc_lower or 'heart' in desc_lower or 'chest' in desc_lower or 'bleed' in desc_lower or 'unconscious' in desc_lower:
        type_name = "Critical Medical Emergency"
    elif 'flood' in desc_lower or 'water' in desc_lower or 'river' in desc_lower or 'drown' in desc_lower:
        type_name = "Flood & Water Hazard"
    elif 'earthquake' in desc_lower or 'quake' in desc_lower or 'tremor' in desc_lower or 'rubble' in desc_lower:
        type_name = "Earthquake & Structural Emergency"
    elif 'missing' in desc_lower or 'lost child' in desc_lower or 'kidnap' in desc_lower:
        type_name = "Missing Person Search"

    # Assemble instructions from retrieved protocols or standard emergency procedures
    steps = []
    dos = []
    donts = []

    if retrieved_protocols:
        main_protocol = retrieved_protocols[0]
        for idx, s in enumerate(main_protocol.steps):
            if isinstance(s, dict):
                steps.append({
                    "step": idx + 1,
                    "title": s.get("title", f"Step {idx + 1}"),
                    "instruction": s.get("instruction", ""),
                    "urgency": "critical" if idx == 0 else "important"
                })
            else:
                steps.append({
                    "step": idx + 1,
                    "title": f"Action {idx + 1}",
                    "instruction": str(s),
                    "urgency": "critical" if idx == 0 else "important"
                })
        dos = main_protocol.dos
        donts = main_protocol.donts
    else:
        steps = [
            {
                "step": 1,
                "title": "Ensure Scene Safety",
                "instruction": "Evaluate the immediate environment for live electrical hazards, approaching traffic, fire, or structural collapse before proceeding.",
                "urgency": "critical"
            },
            {
                "step": 2,
                "title": "Alert Professional Dispatch",
                "instruction": "Call 911 / 112 immediately. State your exact location, number of injured individuals, and current conditions.",
                "urgency": "critical"
            },
            {
                "step": 3,
                "title": "Provide Immediate Life-Safety Care",
                "instruction": "If safe to do so, check responsiveness and breathing. Apply direct pressure to heavy bleeding using a clean cloth or bandage.",
                "urgency": "important"
            },
            {
                "step": 4,
                "title": "Maintain Position & Keep Warm",
                "instruction": "Do not move severely injured persons unless in imminent danger of fire or explosion. Keep victim calm and shielded from elements.",
                "urgency": "important"
            }
        ]
        dos = [
            "Call professional emergency dispatch (911 / 112) immediately",
            "Keep phone battery preserved for dispatch communication",
            "Identify safe exits and meeting points"
        ]
        donts = [
            "Do not enter active fire, smoke, or flooded water areas",
            "Do not move victims with suspected spinal trauma unless immediate death threatens",
            "Do not hang up on emergency dispatchers until instructed"
        ]

    services_recommended = ["Police Dispatch", "Ambulance / EMS"]
    if "fire" in type_name.lower() or "smoke" in type_name.lower():
        services_recommended.append("Fire & Rescue")
    if "flood" in type_name.lower() or "earthquake" in type_name.lower():
        services_recommended.append("Disaster Management & Search/Rescue")

    return {
        "emergency_type": type_name,
        "priority": priority,
        "confidence": confidence,
        "summary": f"Triage assessment for reported {type_name.lower()}. Immediate life-safety intervention recommended.",
        "immediate_instructions": steps,
        "dos": dos,
        "donts": donts,
        "official_services_recommended": services_recommended,
        "emergency_disclaimer": "DISCLAIMER: AI-generated emergency guidance is an assistive reference and DOES NOT replace professional 911/112 emergency services. Always contact official dispatchers immediately.",
        "rag_grounded": True,
        "source_protocols": [p.title for p in retrieved_protocols] if retrieved_protocols else ["Universal First Response Standard"]
    }


def chat_emergency_copilot(messages: List[Dict[str, str]], emergency_context: Dict[str, Any] = None) -> str:
    """Conversational assistant for real-time questions during an emergency."""
    client = get_openai_client()
    latest_user_message = messages[-1]["content"] if messages else ""

    if client:
        try:
            ctx_summary = ""
            if emergency_context:
                ctx_summary = f"Active Emergency Context: Type: {emergency_context.get('emergency_type')}, Priority: {emergency_context.get('priority')}\n"

            system_prompt = (
                "You are an AI Emergency Assistant Copilot. You are providing immediate, concise, and calm instructions "
                "to someone in a crisis situation.\n"
                f"{ctx_summary}"
                "RULES:\n"
                "1. Keep responses very concise (1-3 clear paragraphs or bullet points) because the user is in an emergency.\n"
                "2. Actionable advice first.\n"
                "3. Reiterate calling 911 / 112 if they haven't already done so.\n"
                "4. Be reassuring and clear."
            )

            prompt_messages = [{"role": "system", "content": system_prompt}] + messages
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=prompt_messages,
                temperature=0.3,
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI chat failed: {e}")

    # Fallback contextual response
    user_q = latest_user_message.lower()
    if 'bleed' in user_q or 'blood' in user_q:
        return (
            "**Bleeding Control Steps:**\n"
            "1. Take a clean cloth, towel, or sterile gauze and press directly on the wound with continuous, firm pressure.\n"
            "2. Do not remove the cloth even if it becomes soaked through; place another layer directly on top.\n"
            "3. If the bleeding is arterial (pulsing) or from a limb and does not stop, consider a tourniquet 2-3 inches above the wound (never over a joint).\n"
            "4. Ensure 911/EMS has been dispatched and maintain pressure until paramedics arrive."
        )
    elif 'breath' in user_q or 'cpr' in user_q:
        return (
            "**Breathing & CPR Guidance:**\n"
            "1. Check if the person responds when you tap their collarbone and shout loudly.\n"
            "2. If they are unresponsive and not breathing normally (or only gasping), start CPR immediately.\n"
            "3. Place the heel of your hand on the center of the chest (between nipples), interlock your fingers, and push hard and fast (100-120 beats per minute, to the beat of 'Stayin' Alive').\n"
            "4. Continue chest compressions until emergency personnel arrive or an AED is ready to use."
        )
    elif 'burn' in user_q:
        return (
            "**Burn First-Aid:**\n"
            "1. Immediately cool the burn with cool (not ice-cold) running tap water for at least 10 to 20 minutes.\n"
            "2. Remove tight items (rings, belts) near the area before swelling starts.\n"
            "3. Cover loosely with sterile gauze or clean plastic wrap. Do NOT break blisters or apply butter/oils.\n"
            "4. Seek immediate medical attention for large, blistering, or facial burns."
        )
    elif 'shock' in user_q or 'faint' in user_q or 'dizzy' in user_q:
        return (
            "**Treating Shock:**\n"
            "1. Lay the person flat on their back. If no spinal injury is suspected, elevate their feet about 12 inches.\n"
            "2. Keep the person warm with a jacket or blanket.\n"
            "3. Do not give them anything to eat or drink.\n"
            "4. Monitor breathing and stay with them until emergency dispatch arrives."
        )
    else:
        return (
            "**Immediate Guidance:**\n"
            "Please ensure you and others are in a safe location away from danger. "
            "If you have not already contacted emergency services, dial 911 or 112 right now.\n\n"
            "Stay on the line with the dispatcher, keep the patient calm, and do not attempt heroic actions that put yourself at risk."
        )
