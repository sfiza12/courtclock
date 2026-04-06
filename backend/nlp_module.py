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


def _rule_based_classify(case_data: dict) -> dict:
    """
    Rule-based fallback classifier using keyword matching.
    Returns tags, severity label, and structured explanation.
    """
    crime_description = case_data.get("crime_description", "")
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

    # Build the 'Gold-Standard' structured explanation
    u_score = case_data.get('u_score', 0)
    priority = case_data.get('priority_level', 'LOW')
    detention_days = case_data.get('detention_days', 0)
    max_years = case_data.get('max_sentence_years', 3)
    vuln = case_data.get('vulnerability_flag', 0)
    
    hearings_held = case_data.get('hearings_held', 0)
    hearing_count = case_data.get('hearing_count', 0)
    
    verdict_count = case_data.get('previous_verdict_count', 0)
    verdict_summary = case_data.get('previous_verdicts_summary', 'None')
    
    # Paragraph 1: U-Score Breakdown
    p1 = (
        f"**U-Score Breakdown**: This case has received a {priority.lower()} priority U-Score of {round(u_score)}/100. "
        f"This score is influenced by a {severity_label} severity crime classification "
        f"and {detention_days} days of detention against a {max_years}-year maximum sentence."
    )
    if vuln:
        p1 += " A high vulnerability flag was also detected."

    # Paragraph 2: Urgency Context & 436A Risk
    half_sentence_days = (max_years * 365) / 2
    if detention_days >= half_sentence_days:
        p2 = "**Urgency Impact**: Because the accused has exceeded their half-sentence threshold, this demands immediate judicial review. Delaying this case further directly violates fundamental legal rights under Section 436A CrPC."
    else:
        p2 = f"**Urgency Impact**: The case sits at {round(detention_days/(max_years*365)*100)}% of its maximum sentence limit. Standard priority processing is recommended."
        
    # Paragraph 3: Hearing Delays
    if hearing_count > 0:
        rate = hearings_held / hearing_count
        if rate < 0.5 and hearing_count > 5:
            p3 = f"**Hearing Delays**: This case is suffering from severe adjournment abuse; out of {hearing_count} scheduled hearings, only {hearings_held} were successfully held."
        else:
            p3 = f"**Hearing Delays**: Hearing progression is stable ({hearings_held}/{hearing_count} hearings held)."
    else:
        p3 = "**Hearing Delays**: No significant hearing history available yet."

    # Paragraph 4: Verdict History & Recommendation
    if verdict_count > 0:
        p4_verdicts = f"**Verdict History**: There have been {verdict_count} previous verdicts/orders on this case ({verdict_summary})."
    else:
        p4_verdicts = f"**Verdict History**: There are 0 previous verdicts on record."

    if detention_days >= half_sentence_days:
        p4_rec = "\n\n**Recommendation**: The court should urgently schedule a bail hearing under Section 436A to clear this backlog and prevent an illegal detention violation."
    elif vuln:
        p4_rec = "\n\n**Recommendation**: Flagged for vulnerable individual; schedule priority hearing to expedite resolution."
    else:
        p4_rec = "\n\n**Recommendation**: Proceed with normal scheduling protocols."

    explanation = f"{p1}\n\n{p2}\n\n{p3}\n\n{p4_verdicts}{p4_rec}"

    tag_list = sorted(tags)
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


def classify_case(case_data: dict) -> dict:
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
    crime_description = case_data.get("crime_description", "")
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
            rule_result = _rule_based_classify(case_data)

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
    result = _rule_based_classify(case_data)
    result["model_used"] = "rule-based"
    return result


def is_model_available() -> bool:
    """Check if the transformer model is loaded."""
    return _MODEL_AVAILABLE
