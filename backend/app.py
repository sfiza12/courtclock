"""
app.py — Flask Application Entry Point & Route Registration
CourtClock: AI-Powered Court Case Prioritization System
"""

import os
import sys
import json
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

# Ensure sibling imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_session, Case, User
from scoring_engine import compute_u_score
from nlp_module import classify_case
import bcrypt
import jwt


# ─── App factory ──────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Enable CORS on all routes


# ─── Response helpers ─────────────────────────────────────────────────
def success_response(data, status=200):
    """Wrap data in { success: true, data: ... } envelope."""
    return jsonify({"success": True, "data": data}), status


def error_response(message, status=400):
    """Wrap error in { success: false, error: ... } envelope."""
    return jsonify({"success": False, "error": message}), status


# ═══════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

JWT_SECRET = "super_secret_jwt_key_courtclock"

@app.route("/api/auth/judge-login", methods=["POST"])
def judge_login():
    """
    POST /api/auth/judge-login
    Authenticate judge using email and password.
    """
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response("Email and password are required.", 400)

    session = get_session()
    try:
        user = session.query(User).filter(User.email == email).first()
        
        if not user or user.role != "judge":
            return error_response("Invalid credentials or insufficient permissions.", 401)
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return error_response("Invalid credentials.", 401)

        # Generate JWT
        token = jwt.encode({
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "exp": datetime.utcnow().timestamp() + 86400 # 24 hours expiry
        }, JWT_SECRET, algorithm="HS256")

        return success_response({
            "token": token,
            "user": user.to_dict()
        })
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        session.close()

@app.route("/api/auth/judge-signup", methods=["POST"])
def judge_signup():
    """
    POST /api/auth/judge-signup
    Register a new judge using email and password.
    """
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response("Email and password are required.", 400)

    session = get_session()
    try:
        # Check if user already exists
        existing = session.query(User).filter(User.email == email).first()
        if existing:
            return error_response("An account with this email already exists.", 409)
            
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = User(email=email, password_hash=hashed, role="judge")
        session.add(user)
        session.commit()

        return success_response({
            "message": "Account created successfully. Please log in."
        })
    except Exception as e:
        session.rollback()
        return error_response(str(e), 500)
    finally:
        session.close()

# ═══════════════════════════════════════════════════════════════════════
#  CASE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.route("/api/cases", methods=["GET"])
def get_all_cases():
    """
    GET /api/cases
    Returns all cases sorted by filing_date ascending (old system ordering).
    """
    session = get_session()
    try:
        cases = session.query(Case).order_by(Case.filing_date.asc()).all()
        return success_response([c.to_dict() for c in cases])
    finally:
        session.close()


@app.route("/api/cases/priority", methods=["GET"])
def get_cases_by_priority():
    """
    GET /api/cases/priority
    Returns all cases sorted by u_score DESC (CourtClock prioritization).
    """
    session = get_session()
    try:
        cases = session.query(Case).order_by(Case.u_score.desc()).all()
        return success_response([c.to_dict() for c in cases])
    finally:
        session.close()


@app.route("/api/cases/<int:case_id>", methods=["GET"])
def get_case_detail(case_id):
    """
    GET /api/cases/<id>
    Returns full details for a single case.
    """
    session = get_session()
    try:
        case = session.query(Case).filter(Case.id == case_id).first()
        if not case:
            return error_response(f"Case with id {case_id} not found.", 404)
        return success_response(case.to_dict())
    finally:
        session.close()


@app.route("/api/cases/score-all", methods=["POST"])
def score_all_cases():
    """
    POST /api/cases/score-all
    Recalculate U-Score for ALL cases and save to DB.
    """
    session = get_session()
    try:
        cases = session.query(Case).all()
        scored_count = 0

        for case in cases:
            # Calculate detention days
            detention_days = 0
            if case.detention_start_date:
                detention_days = (datetime.now() - case.detention_start_date).days
                detention_days = max(detention_days, 0)

            scores = compute_u_score(
                detention_days=detention_days,
                max_sentence_years=case.max_sentence_years,
                filing_date=case.filing_date,
                case_type=case.case_type,
                vulnerability_flag=case.vulnerability_flag,
                crime_section=case.crime_section,
                hearing_count=case.hearing_count,
                hearings_held=case.hearings_held,
            )

            case.u_score = scores["u_score"]
            case.dsr_score = scores["dsr_score"]
            case.age_score = scores["age_score"]
            case.vulnerability_score = scores["vulnerability_score"]
            case.rights_score = scores["rights_score"]
            case.severity_score = scores["severity_score"]
            case.adjournment_score = scores["adjournment_score"]
            case.priority_level = scores["priority_level"]
            scored_count += 1

        session.commit()
        return success_response({
            "message": f"Successfully scored {scored_count} cases.",
            "scored_count": scored_count,
        })
    finally:
        session.close()


# ═══════════════════════════════════════════════════════════════════════
#  ALERTS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.route("/api/alerts/436a", methods=["GET"])
def get_436a_alerts():
    """
    GET /api/alerts/436a
    Returns cases where detention >= 50% of max sentence (Section 436A CrPC).
    These are cases with potential rights violations requiring judicial review.
    """
    session = get_session()
    try:
        cases = session.query(Case).filter(
            Case.detention_start_date.isnot(None),
            Case.is_undertrial == True,
        ).all()

        flagged = []
        for case in cases:
            detention_days = (datetime.now() - case.detention_start_date).days
            detention_days = max(detention_days, 0)
            half_sentence_days = (case.max_sentence_years * 365) / 2

            if detention_days >= half_sentence_days:
                case_dict = case.to_dict()
                case_dict["detention_days"] = detention_days
                case_dict["half_sentence_days"] = round(half_sentence_days, 1)
                case_dict["detention_ratio"] = round(
                    detention_days / (case.max_sentence_years * 365), 4
                ) if case.max_sentence_years > 0 else 1.0
                flagged.append(case_dict)

        # Sort by detention ratio descending (most critical first)
        flagged.sort(key=lambda x: x.get("detention_ratio", 0), reverse=True)

        return success_response({
            "count": len(flagged),
            "cases": flagged,
        })
    finally:
        session.close()


# ═══════════════════════════════════════════════════════════════════════
#  STATS ENDPOINT
# ═══════════════════════════════════════════════════════════════════════

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """
    GET /api/stats
    Returns aggregate statistics for the case database.
    """
    session = get_session()
    try:
        from sqlalchemy import func

        total = session.query(Case).count()
        critical_count = session.query(Case).filter(
            Case.priority_level == "CRITICAL"
        ).count()
        high_count = session.query(Case).filter(
            Case.priority_level == "HIGH"
        ).count()
        medium_count = session.query(Case).filter(
            Case.priority_level == "MEDIUM"
        ).count()
        low_count = session.query(Case).filter(
            Case.priority_level == "LOW"
        ).count()

        avg_u_score = session.query(func.avg(Case.u_score)).scalar() or 0.0

        # Count 436A violations
        undertrial_cases = session.query(Case).filter(
            Case.detention_start_date.isnot(None),
            Case.is_undertrial == True,
        ).all()

        violations_436a = 0
        for case in undertrial_cases:
            detention_days = (datetime.now() - case.detention_start_date).days
            half_sentence = (case.max_sentence_years * 365) / 2
            if detention_days >= half_sentence:
                violations_436a += 1

        return success_response({
            "total": total,
            "critical_count": critical_count,
            "high_count": high_count,
            "medium_count": medium_count,
            "low_count": low_count,
            "violations_436a": violations_436a,
            "avg_u_score": round(avg_u_score, 2),
        })
    finally:
        session.close()


# ═══════════════════════════════════════════════════════════════════════
#  AI / NLP ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.route("/api/ai/classify/<int:case_id>", methods=["POST"])
def ai_classify_case(case_id):
    """
    POST /api/ai/classify/<id>
    Run InLegalBERT (or fallback) classifier on a case.
    Stores results in the case record.
    """
    session = get_session()
    try:
        case = session.query(Case).filter(Case.id == case_id).first()
        if not case:
            return error_response(f"Case with id {case_id} not found.", 404)

        # Calculate detention days for the classifier
        detention_days = 0
        if case.detention_start_date:
            detention_days = (datetime.now() - case.detention_start_date).days
            detention_days = max(detention_days, 0)
            
        case_dict = case.to_dict()
        case_dict["detention_days"] = detention_days

        result = classify_case(case_dict)

        # Save to DB
        case.ai_tags = json.dumps(result["tags"])
        case.ai_explanation = result["explanation"]
        session.commit()

        return success_response({
            "case_id": case_id,
            "tags": result["tags"],
            "severity_label": result["severity_label"],
            "explanation": result["explanation"],
            "model_used": result["model_used"],
        })
    finally:
        session.close()


@app.route("/api/ai/explain/<int:case_id>", methods=["GET"])
def ai_explain_case(case_id):
    """
    GET /api/ai/explain/<id>
    Return stored AI explanation for a case. Auto-generates if missing.
    """
    session = get_session()
    try:
        case = session.query(Case).filter(Case.id == case_id).first()
        if not case:
            return error_response(f"Case with id {case_id} not found.", 404)

        # Auto-compute if missing
        if not case.ai_explanation:
            detention_days = 0
            if case.detention_start_date:
                detention_days = (datetime.now() - case.detention_start_date).days
                detention_days = max(detention_days, 0)
                
            case_dict = case.to_dict()
            case_dict["detention_days"] = detention_days

            result = classify_case(case_dict)
            case.ai_tags = json.dumps(result["tags"])
            case.ai_explanation = result["explanation"]
            session.commit()

        tags = []
        if case.ai_tags:
            try:
                tags = json.loads(case.ai_tags)
            except json.JSONDecodeError:
                tags = []

        return success_response({
            "case_id": case_id,
            "ai_explanation": case.ai_explanation,
            "ai_tags": tags,
        })
    finally:
        session.close()


# ═══════════════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def health_check():
    """Root health check endpoint."""
    return success_response({
        "service": "CourtClock API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "GET  /api/cases",
            "GET  /api/cases/priority",
            "GET  /api/cases/<id>",
            "POST /api/cases/score-all",
            "GET  /api/alerts/436a",
            "GET  /api/stats",
            "POST /api/ai/classify/<id>",
            "GET  /api/ai/explain/<id>",
        ],
    })


# ═══════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    init_db()
    print("\n" + "=" * 60)
    print("  CourtClock API — AI-Powered Case Prioritization")
    print("  Running on http://127.0.0.1:5000")
    print("=" * 60 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
