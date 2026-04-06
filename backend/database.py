"""
database.py — SQLAlchemy Models & Database Initialization
CourtClock case management schema with all scoring fields.
"""

import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
)
from sqlalchemy.orm import declarative_base, sessionmaker

# Database file lives alongside the backend code
_DB_DIR = os.path.dirname(os.path.abspath(__file__))
_DB_PATH = os.path.join(_DB_DIR, "courtclock.db")
_DB_URI = f"sqlite:///{_DB_PATH}"

engine = create_engine(_DB_URI, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Case(Base):
    """Represents a single court case with all scoring metadata."""
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String(50), unique=True, nullable=False, index=True)
    accused_name = Column(String(200), nullable=False)
    crime_section = Column(String(20), nullable=False)
    crime_description = Column(Text, nullable=True)

    filing_date = Column(DateTime, nullable=False)
    detention_start_date = Column(DateTime, nullable=True)
    max_sentence_years = Column(Float, nullable=False, default=3.0)

    hearing_count = Column(Integer, nullable=False, default=0)
    hearings_held = Column(Integer, nullable=False, default=0)
    vulnerability_flag = Column(Integer, nullable=False, default=0)  # 0 or 1

    is_undertrial = Column(Boolean, nullable=False, default=True)
    case_type = Column(String(50), nullable=False, default="criminal")

    previous_verdict_count = Column(Integer, nullable=False, default=0)
    previous_verdicts_summary = Column(Text, nullable=True)

    # Composite U-Score and sub-scores
    u_score = Column(Float, nullable=True, default=0.0)
    dsr_score = Column(Float, nullable=True, default=0.0)
    age_score = Column(Float, nullable=True, default=0.0)
    vulnerability_score = Column(Float, nullable=True, default=0.0)
    rights_score = Column(Float, nullable=True, default=0.0)
    severity_score = Column(Float, nullable=True, default=0.0)
    adjournment_score = Column(Float, nullable=True, default=0.0)

    priority_level = Column(String(20), nullable=True, default="LOW")

    # AI/NLP fields
    ai_explanation = Column(Text, nullable=True)
    ai_tags = Column(Text, nullable=True)  # JSON string

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        """Serialize to dictionary for JSON responses."""
        return {
            "id": self.id,
            "case_number": self.case_number,
            "accused_name": self.accused_name,
            "crime_section": self.crime_section,
            "crime_description": self.crime_description,
            "filing_date": self.filing_date.isoformat() if self.filing_date else None,
            "detention_start_date": (
                self.detention_start_date.isoformat()
                if self.detention_start_date else None
            ),
            "max_sentence_years": self.max_sentence_years,
            "hearing_count": self.hearing_count,
            "hearings_held": self.hearings_held,
            "vulnerability_flag": self.vulnerability_flag,
            "is_undertrial": self.is_undertrial,
            "case_type": self.case_type,
            "previous_verdict_count": self.previous_verdict_count,
            "previous_verdicts_summary": self.previous_verdicts_summary,
            "u_score": round(self.u_score, 2) if self.u_score is not None else None,
            "dsr_score": round(self.dsr_score, 4) if self.dsr_score is not None else None,
            "age_score": round(self.age_score, 4) if self.age_score is not None else None,
            "vulnerability_score": (
                round(self.vulnerability_score, 4)
                if self.vulnerability_score is not None else None
            ),
            "rights_score": (
                round(self.rights_score, 4)
                if self.rights_score is not None else None
            ),
            "severity_score": (
                round(self.severity_score, 4)
                if self.severity_score is not None else None
            ),
            "adjournment_score": (
                round(self.adjournment_score, 4)
                if self.adjournment_score is not None else None
            ),
            "priority_level": self.priority_level,
            "ai_explanation": self.ai_explanation,
            "ai_tags": self.ai_tags,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }


class User(Base):
    """Represents a user in the system (e.g., judge, admin)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False, default="judge")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(engine)
    print("[DB] Database initialized at", _DB_PATH)


def get_session():
    """Return a new database session."""
    return SessionLocal()


if __name__ == "__main__":
    init_db()
    print("[DB] Tables created successfully.")
