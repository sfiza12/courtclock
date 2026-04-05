# CourtClock Backend — AI-Powered Court Case Prioritization

An intelligent case prioritization system for the Indian judiciary, built with Python, Flask, and SQLAlchemy. Uses a composite **U-Score** formula to rank cases by urgency based on 6 weighted factors.

## Quick Start

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 3. Install core dependencies
pip install flask flask-cors sqlalchemy

# 4. (Optional) Install NLP dependencies for AI classification
pip install transformers torch

# 5. Generate 300 synthetic cases & populate the database
python data_generator.py

# 6. Start the API server
python app.py
```

The server runs on **http://127.0.0.1:5000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cases` | All cases sorted by filing date (traditional) |
| `GET` | `/api/cases/priority` | All cases sorted by U-Score DESC (CourtClock) |
| `GET` | `/api/cases/<id>` | Full detail for a single case |
| `POST` | `/api/cases/score-all` | Recalculate U-Scores for all cases |
| `GET` | `/api/alerts/436a` | Cases exceeding 50% detention threshold |
| `GET` | `/api/stats` | Aggregate statistics |
| `POST` | `/api/ai/classify/<id>` | Run AI classifier on a case |
| `GET` | `/api/ai/explain/<id>` | Retrieve stored AI explanation |

All endpoints return a `{ "success": bool, "data": ... }` JSON wrapper.

---

## U-Score Formula

```
U-Score = (
    0.30 × DSR          +   # Detention-to-Sentence Ratio
    0.20 × Case Age     +   # Age vs. case-type benchmark
    0.15 × Vulnerability +   # Elderly/minor/disabled flag
    0.20 × Rights       +   # Section 436A violation check
    0.10 × Severity     +   # Crime severity (IPC mapping)
    0.05 × Adjournment      # Hearing miss rate
) × 100
```

**Priority Levels:**
- `CRITICAL` → U-Score ≥ 75
- `HIGH` → U-Score ≥ 50
- `MEDIUM` → U-Score ≥ 25
- `LOW` → U-Score < 25

---

## Project Structure

```
backend/
├── app.py                  # Flask app + route registration
├── database.py             # SQLAlchemy models + DB init
├── scoring_engine.py       # U-Score calculator (core logic)
├── data_generator.py       # Synthetic case generator (300 cases)
├── nlp_module.py           # InLegalBERT classifier (stretch)
├── section_mapper.py       # IPC section → max sentence mapping
├── requirements.txt        # Python dependencies
├── courtclock.db           # SQLite database (auto-generated)
└── data/
    └── ipc_sections.json   # Crime code → max punishment mapping
```

---

## Tech Stack

- **Python 3.10+**
- **Flask** — REST API framework
- **SQLAlchemy** — ORM for SQLite database
- **Flask-CORS** — Cross-origin request support
- **InLegalBERT / Legal-BERT** — NLP case classification (optional)

---

## Section 436A CrPC

The system flags cases where an undertrial prisoner has been detained for a period **exceeding half of the maximum sentence** prescribed for the offence. This is a fundamental rights safeguard under Indian criminal procedure.

---

## Synthetic Data

The data generator (`data_generator.py`) creates 300 realistic cases with:
- Indian names and case number formats
- 28 different IPC sections
- Varied detention durations (some deliberately past 436A threshold)
- Realistic hearing patterns with adjournment rates
- ~20% vulnerability flags
- Seeded with `random.seed(42)` for reproducibility
