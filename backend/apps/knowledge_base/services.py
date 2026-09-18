import re
from typing import List, Dict, Any
from .models import EmergencyProtocol


def tokenize(text: str) -> set:
    """Normalize text into lowercase alphanumeric token set."""
    if not text:
        return set()
    return set(re.findall(r'[a-z0-9]+', text.lower()))


def retrieve_relevant_protocols(query: str, category: str = None, top_k: int = 3) -> List[EmergencyProtocol]:
    """
    RAG Retrieval Service:
    Searches the verified emergency knowledge base for protocols most relevant to the query.
    Uses token overlap, keyword matching, and category boosting to rank official procedures.
    """
    query_tokens = tokenize(query)
    protocols = EmergencyProtocol.objects.all()

    if category and category.lower() != 'other' and category.lower() != 'all':
        cat_lower = category.lower().replace(' ', '_')
        matched_category = protocols.filter(category__icontains=cat_lower)
        if matched_category.exists():
            protocols = matched_category

    scored_protocols = []
    for protocol in protocols:
        score = 0.0
        proto_title_tokens = tokenize(protocol.title)
        proto_kw_tokens = tokenize(protocol.keywords)
        proto_summary_tokens = tokenize(protocol.summary)

        # Title match has highest weight
        score += len(query_tokens.intersection(proto_title_tokens)) * 5.0
        # Keyword match has high weight
        score += len(query_tokens.intersection(proto_kw_tokens)) * 3.0
        # Summary match has moderate weight
        score += len(query_tokens.intersection(proto_summary_tokens)) * 1.5

        # Category match boost
        if category and category.lower() in protocol.category.lower():
            score += 4.0

        scored_protocols.append((score, protocol))

    # Sort descending by score
    scored_protocols.sort(key=lambda x: x[0], reverse=True)

    # Return top_k protocols; if scores are 0, return default high-priority general/category protocol
    results = [proto for score, proto in scored_protocols[:top_k] if score > 0]
    if not results and scored_protocols:
        results = [scored_protocols[0][1]]

    return results


def format_rag_context(protocols: List[EmergencyProtocol]) -> str:
    """Formats retrieved protocols into structured grounding text for the AI."""
    if not protocols:
        return "No specific verified protocol found. Use standard universal emergency safety practices."

    sections = []
    for p in protocols:
        steps_text = "\n".join([f"  {idx+1}. {s.get('title', '')}: {s.get('instruction', '')}" if isinstance(s, dict) else f"  {idx+1}. {s}" for idx, s in enumerate(p.steps)])
        dos_text = ", ".join(p.dos) if p.dos else "Follow official dispatcher advice."
        donts_text = ", ".join(p.donts) if p.donts else "Do not place yourself in danger."

        section = (
            f"--- VERIFIED PROTOCOL: {p.title} (Source: {p.source_agency}) ---\n"
            f"Category: {p.category} | Recommended Severity: {p.severity_default}\n"
            f"Summary: {p.summary}\n"
            f"Immediate Life-Safety Steps:\n{steps_text}\n"
            f"Critical Dos: {dos_text}\n"
            f"Critical Don'ts: {donts_text}\n"
        )
        sections.append(section)

    return "\n\n".join(sections)
