"""
nlp_module.py — InLegalBERT / Legal-BERT Case Classifier (Stretch Goal)
Provides AI-powered case classification with rule-based fallback.
"""

import re

# ─── Try loading HuggingFace model ───────────────────────────────────
_MODEL_AVAILABLE = False
_classifier = None

try:
    from transformers import pipeline

    # Try InLegalBERT first, fall back to legal-bert-base-uncased
    MODEL_NAMES = [
        "law-ai/InLegalBERT",
        "nlpaueb/legal-bert-base-uncased",
    ]

    for model_name in MODEL_NAMES:
        try:
            _classifier = pipeline(
                "text-classification",
                model=model_name,
                top_k=3,
                truncation=True,
                max_length=512,
            )
            _MODEL_AVAILABLE = True
            print(f"[NLP] Loaded model: {model_name}")
            break
        except Exception as e:
            print(f"[NLP] Could not load {model_name}: {e}")
            continue

    if not _MODEL_AVAILABLE:
        print("[NLP] No transformer model available. Using rule-based fallback.")

except ImportError:
    print("[NLP] transformers library not installed. Using rule-based fallback.")


# ─── Keyword-based classification ────────────────────────────────────
VIOLENCE_KEYWORDS = [
    "murder", "kill", "stab", "shot", "attack", "assault", "hurt",
    "injuries", "grievous", "acid", "axe", "weapon", "death", "died",
    "homicide", "pushed", "poisoning", "beat", "brawl", "fractures",
]

SEXUAL_KEYWORDS = [
    "rape", "sexual", "modesty", "harassment", "obscene", "eve-teasing",
    "outraged",
]

PROPERTY_KEYWORDS = [
    "theft", "stole", "stolen", "robbery", "rob", "snatch", "dacoity",
    "burglary", "broke into", "valuables", "jewellery", "chain",
]

FRAUD_KEYWORDS = [
    "cheat", "fraud", "forged", "forgery", "fake", "bogus", "impersonated",
    "embezzled", "misappropriated", "ponzi", "scam", "falsified",
    "dishonoured", "bounced", "cheque", "investment scheme",
]

KIDNAPPING_KEYWORDS = [
    "kidnap", "abducted", "ransom", "captive", "confined", "detention",
    "hostage",
]

DOMESTIC_KEYWORDS = [
    "domestic", "dowry", "cruelty", "wife", "husband", "in-laws",
    "torture", "marital",
]

THREAT_KEYWORDS = [
    "threat", "intimidation", "extort", "hafta", "demanded",
]

UNDERTRIAL_KEYWORDS = [
    "undertrial", "detention", "custody", "bail", "remand",
]

# ─── Severity classification by keywords ─────────────────────────────
SEVERITY_KEYWORD_MAP = {
    "heinous": VIOLENCE_KEYWORDS + SEXUAL_KEYWORDS + KIDNAPPING_KEYWORDS,
    "serious": PROPERTY_KEYWORDS + FRAUD_KEYWORDS,
    "moderate": DOMESTIC_KEYWORDS + THREAT_KEYWORDS,
    "minor": [],
}


def _rule_based_classify(crime_description: str) -> dict:
    """
    Rule-based fallback classifier using keyword matching.
    Returns tags, severity label, and explanation.
    """
    text = crime_description.lower()
    tags = set()

    # Check each category
    for kw in VIOLENCE_KEYWORDS:
        if kw in text:
            tags.add("violent")
            break

    for kw in SEXUAL_KEYWORDS:
        if kw in text:
            tags.add("sexual_offence")
            break

    for kw in PROPERTY_KEYWORDS:
        if kw in text:
            tags.add("property")
            break

    for kw in FRAUD_KEYWORDS:
        if kw in text:
            tags.add("fraud")
            break

    for kw in KIDNAPPING_KEYWORDS:
        if kw in text:
            tags.add("kidnapping")
            break

    for kw in DOMESTIC_KEYWORDS:
        if kw in text:
            tags.add("domestic_violence")
            break

    for kw in THREAT_KEYWORDS:
        if kw in text:
            tags.add("threat_extortion")
            break

    for kw in UNDERTRIAL_KEYWORDS:
        if kw in text:
            tags.add("undertrial")
            break

    # If no tags matched
    if not tags:
        tags.add("general_criminal")

    # Always add undertrial tag if detected
    # Determine severity
    severity_label = "minor"
    for level in ["heinous", "serious", "moderate"]:
        keywords = SEVERITY_KEYWORD_MAP[level]
        for kw in keywords:
            if kw in text:
                severity_label = level
                break
        if severity_label != "minor":
            break

    # Build explanation
    tag_list = sorted(tags)
    explanation = (
        f"This case has been classified as '{severity_label}' severity "
        f"based on keyword analysis. Identified categories: {', '.join(tag_list)}. "
        f"The description indicates involvement of "
        f"{_describe_tags(tag_list)}."
    )

    return {
        "tags": tag_list,
        "severity_label": severity_label,
        "explanation": explanation,
    }


def _describe_tags(tags: list) -> str:
    """Create human-readable description from tags."""
    descriptions = {
        "violent": "violent criminal acts",
        "sexual_offence": "sexual offences",
        "property": "property-related crimes",
        "fraud": "financial fraud or cheating",
        "kidnapping": "kidnapping or abduction",
        "domestic_violence": "domestic violence or cruelty",
        "threat_extortion": "threats or extortion",
        "undertrial": "undertrial detention issues",
        "general_criminal": "general criminal activity",
    }
    parts = [descriptions.get(t, t) for t in tags]
    if len(parts) == 1:
        return parts[0]
    return ", ".join(parts[:-1]) + " and " + parts[-1]


def classify_case(crime_description: str) -> dict:
    """
    Classify a case using InLegalBERT if available, else rule-based fallback.

    Returns:
        {
            "tags": ["undertrial", "violent", "property"],
            "severity_label": "serious",
            "explanation": "This case involves...",
            "model_used": "InLegalBERT" | "rule-based"
        }
    """
    if not crime_description or not crime_description.strip():
        return {
            "tags": ["unclassified"],
            "severity_label": "moderate",
            "explanation": "No crime description provided for classification.",
            "model_used": "none",
        }

    # Try transformer model
    if _MODEL_AVAILABLE and _classifier:
        try:
            results = _classifier(crime_description[:512])
            # Combine transformer results with rule-based tags
            rule_result = _rule_based_classify(crime_description)

            # Use rule-based tags (more reliable for our domain)
            # but enhance explanation with model confidence
            model_labels = []
            if isinstance(results, list) and len(results) > 0:
                if isinstance(results[0], list):
                    model_labels = [r["label"] for r in results[0][:3]]
                else:
                    model_labels = [r["label"] for r in results[:3]]

            explanation = (
                f"{rule_result['explanation']} "
                f"AI model also identified labels: {', '.join(model_labels)}."
            )

            return {
                "tags": rule_result["tags"],
                "severity_label": rule_result["severity_label"],
                "explanation": explanation,
                "model_used": "InLegalBERT",
            }
        except Exception as e:
            print(f"[NLP] Model inference failed: {e}. Falling back to rules.")

    # Fallback to rule-based
    result = _rule_based_classify(crime_description)
    result["model_used"] = "rule-based"
    return result


def is_model_available() -> bool:
    """Check if the transformer model is loaded."""
    return _MODEL_AVAILABLE
