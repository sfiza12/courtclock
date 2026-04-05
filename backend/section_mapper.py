"""
section_mapper.py — IPC Section → Max Sentence & Severity Mapper
Maps Indian Penal Code sections to their maximum punishments and severity categories.
"""

import json
import os

# Load IPC sections data from JSON
_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
_IPC_FILE = os.path.join(_DATA_DIR, "ipc_sections.json")

with open(_IPC_FILE, "r", encoding="utf-8") as f:
    IPC_SECTIONS = json.load(f)

# Severity category → numeric score
SEVERITY_MAP = {
    "heinous": 1.0,
    "serious": 0.7,
    "moderate": 0.4,
    "minor": 0.2,
}


def get_max_sentence(section_code: str) -> float:
    """
    Return the maximum sentence in years for a given IPC section code.
    Falls back to 3 years if the section is not found.
    """
    section_code = str(section_code).strip()
    entry = IPC_SECTIONS.get(section_code)
    if entry:
        return float(entry["max_sentence_years"])
    return 3.0  # Default fallback


def get_severity_score(section_code: str) -> float:
    """
    Return a severity score (0.0–1.0) for a given IPC section code.
    Uses category mapping: heinous=1.0, serious=0.7, moderate=0.4, minor=0.2.
    Falls back to 0.4 (moderate) if the section is not found.
    """
    section_code = str(section_code).strip()
    entry = IPC_SECTIONS.get(section_code)
    if entry:
        return SEVERITY_MAP.get(entry.get("category", "moderate"), 0.4)
    return 0.4  # Default moderate


def get_severity_category(section_code: str) -> str:
    """
    Return the severity category string for a given IPC section code.
    One of: heinous, serious, moderate, minor.
    """
    section_code = str(section_code).strip()
    entry = IPC_SECTIONS.get(section_code)
    if entry:
        return entry.get("category", "moderate")
    return "moderate"


def get_section_description(section_code: str) -> str:
    """
    Return the human-readable description of an IPC section.
    """
    section_code = str(section_code).strip()
    entry = IPC_SECTIONS.get(section_code)
    if entry:
        return entry.get("description", "Unknown offence")
    return "Unknown offence"


def list_all_sections() -> dict:
    """Return the full IPC sections dictionary."""
    return IPC_SECTIONS
