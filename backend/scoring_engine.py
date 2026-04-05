"""
scoring_engine.py — U-Score Calculator (Core Logic)
Computes the Urgency Score for court cases based on 6 weighted factors.
"""

from datetime import datetime, date
from section_mapper import get_severity_score


# ─── Case-type benchmarks (days) for age scoring ──────────────────────
CASE_TYPE_BENCHMARKS = {
    "civil": 548,
    "criminal": 365,
    "cheque_bounce": 180,
    "family": 365,
    "motor_accident": 365,
    "labor": 365,
    "land": 730,
    "consumer": 180,
    "writ": 365,
    "appeal": 548,
}

# ─── U-Score weights ──────────────────────────────────────────────────
WEIGHTS = {
    "dsr": 0.30,
    "age": 0.20,
    "vulnerability": 0.15,
    "rights": 0.20,
    "severity": 0.10,
    "adjournment": 0.05,
}


# ─── Individual scoring functions ─────────────────────────────────────

def calc_dsr(detention_days: int, max_sentence_years: float) -> float:
    """
    Detention-to-Sentence Ratio.
    Higher ratio = accused has served more of their max sentence while undertrial.
    Returns 0.0–1.0.
    """
    if max_sentence_years <= 0:
        return 1.0  # Edge case: no defined sentence → maximum urgency
    max_sentence_days = max_sentence_years * 365
    ratio = detention_days / max_sentence_days
    return min(ratio, 1.0)


def calc_case_age(filing_date, case_type: str) -> float:
    """
    Case age relative to the benchmark for that case type.
    Older-than-benchmark cases score higher.
    Returns 0.0–1.0.
    """
    if isinstance(filing_date, str):
        filing_date = datetime.fromisoformat(filing_date)
    if isinstance(filing_date, datetime):
        filing_date = filing_date.date()

    today = date.today()
    actual_days = (today - filing_date).days
    benchmark = CASE_TYPE_BENCHMARKS.get(case_type.lower(), 365)
    if benchmark <= 0:
        return 1.0
    return min(actual_days / benchmark, 1.0)


def calc_vulnerability(vulnerability_flag: int) -> float:
    """
    Binary vulnerability indicator.
    1 if accused is elderly/minor/disabled/economically weak, else 0.
    Returns 0.0 or 1.0.
    """
    return 1.0 if vulnerability_flag else 0.0


def calc_rights_violation(detention_days: int, max_sentence_years: float) -> float:
    """
    Section 436A CrPC — right against excessive detention.
    Full score (1.0) if detention >= 50% of max sentence.
    Returns 0.0–1.0.
    """
    if max_sentence_years <= 0:
        return 1.0
    half_sentence_days = (max_sentence_years * 365) / 2
    if detention_days >= half_sentence_days:
        return 1.0
    return detention_days / half_sentence_days


def calc_severity(crime_section: str) -> float:
    """
    Crime severity based on IPC section classification.
    heinous=1.0, serious=0.7, moderate=0.4, minor=0.2.
    Returns 0.0–1.0.
    """
    return get_severity_score(crime_section)


def calc_adjournment(hearing_count: int, hearings_held: int) -> float:
    """
    Adjournment abuse score — how many scheduled hearings were missed.
    Higher missed ratio = higher score.
    Returns 0.0–1.0.
    """
    if hearing_count <= 0:
        return 0.0
    if hearings_held > hearing_count:
        hearings_held = hearing_count
    missed_ratio = 1.0 - (hearings_held / hearing_count)
    return min(missed_ratio, 1.0)


# ─── Composite U-Score ────────────────────────────────────────────────

def compute_u_score(
    detention_days: int,
    max_sentence_years: float,
    filing_date,
    case_type: str,
    vulnerability_flag: int,
    crime_section: str,
    hearing_count: int,
    hearings_held: int,
) -> dict:
    """
    Compute the full U-Score and all sub-scores.

    Returns a dict:
        {
            "u_score": float (0–100),
            "dsr_score": float,
            "age_score": float,
            "vulnerability_score": float,
            "rights_score": float,
            "severity_score": float,
            "adjournment_score": float,
            "priority_level": str,
        }
    """
    dsr = calc_dsr(detention_days, max_sentence_years)
    age = calc_case_age(filing_date, case_type)
    vuln = calc_vulnerability(vulnerability_flag)
    rights = calc_rights_violation(detention_days, max_sentence_years)
    severity = calc_severity(crime_section)
    adj = calc_adjournment(hearing_count, hearings_held)

    u_score = (
        WEIGHTS["dsr"] * dsr
        + WEIGHTS["age"] * age
        + WEIGHTS["vulnerability"] * vuln
        + WEIGHTS["rights"] * rights
        + WEIGHTS["severity"] * severity
        + WEIGHTS["adjournment"] * adj
    ) * 100

    # Determine priority level
    if u_score >= 75:
        priority = "CRITICAL"
    elif u_score >= 50:
        priority = "HIGH"
    elif u_score >= 25:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return {
        "u_score": round(u_score, 2),
        "dsr_score": round(dsr, 4),
        "age_score": round(age, 4),
        "vulnerability_score": round(vuln, 4),
        "rights_score": round(rights, 4),
        "severity_score": round(severity, 4),
        "adjournment_score": round(adj, 4),
        "priority_level": priority,
    }


def get_priority_label(u_score: float) -> str:
    """Return priority label for a given U-Score."""
    if u_score >= 75:
        return "CRITICAL"
    elif u_score >= 50:
        return "HIGH"
    elif u_score >= 25:
        return "MEDIUM"
    return "LOW"
