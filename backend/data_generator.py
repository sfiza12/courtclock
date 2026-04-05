"""
data_generator.py — Synthetic Case Generator (300 cases)
Generates realistic Indian court cases with varied parameters for CourtClock testing.
"""

import random
import json
import sys
import os
from datetime import datetime, timedelta

# Ensure we can import sibling modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_session, Case
from section_mapper import get_max_sentence, get_section_description
from scoring_engine import compute_u_score

# ─── Reproducibility ──────────────────────────────────────────────────
random.seed(42)

# ─── Realistic Indian names ──────────────────────────────────────────
FIRST_NAMES_MALE = [
    "Rajesh", "Suresh", "Amit", "Anil", "Vijay", "Sanjay", "Manoj",
    "Rahul", "Rakesh", "Deepak", "Ashok", "Ravi", "Ajay", "Pradeep",
    "Naveen", "Sunil", "Mohan", "Vinod", "Ramesh", "Mukesh",
    "Harish", "Dinesh", "Yogesh", "Ganesh", "Mahesh",
    "Satish", "Girish", "Ritesh", "Kamal", "Vivek",
    "Arjun", "Krishna", "Shiva", "Gopal", "Hari",
    "Bharat", "Pankaj", "Nitin", "Sachin", "Gaurav",
]

FIRST_NAMES_FEMALE = [
    "Sunita", "Anita", "Priya", "Kavita", "Neeta", "Rekha", "Meena",
    "Pooja", "Sita", "Geeta", "Lata", "Shanti", "Rani", "Savitri",
    "Asha", "Usha", "Lakshmi", "Kamla", "Radha", "Seema",
    "Nisha", "Ritu", "Swati", "Manju", "Saroj",
]

LAST_NAMES = [
    "Sharma", "Verma", "Kumar", "Singh", "Gupta", "Patel", "Yadav",
    "Mishra", "Joshi", "Pandey", "Tiwari", "Dubey", "Chauhan", "Reddy",
    "Nair", "Pillai", "Das", "Bose", "Chatterjee", "Banerjee",
    "Mukherjee", "Thakur", "Rajput", "Srivastava", "Agarwal",
    "Saxena", "Malhotra", "Kapoor", "Mehta", "Shah",
    "Jain", "Prasad", "Devi", "Chowdhury", "Iyer",
    "Naidu", "Rao", "Menon", "Kulkarni", "Deshmukh",
]

# ─── IPC Sections to sample from ─────────────────────────────────────
CRIME_SECTIONS = [
    "302", "304", "307", "376", "392", "395", "420", "379", "380",
    "323", "324", "325", "326", "354", "363", "364", "384",
    "406", "409", "419", "468", "471", "498A", "506", "509",
    "138_NI", "120B", "342",
]

# ─── Case type mapping by section ────────────────────────────────────
SECTION_TO_TYPE = {
    "138_NI": "cheque_bounce",
    "498A": "criminal",
}

CASE_TYPES = ["criminal", "cheque_bounce"]

# ─── Crime descriptions ──────────────────────────────────────────────
CRIME_DESCRIPTIONS = {
    "302": [
        "Accused allegedly murdered the victim during a dispute over property.",
        "Murder committed during a domestic altercation; victim died from stab wounds.",
        "Gang-related murder; accused shot the victim in a public area.",
    ],
    "304": [
        "Accused drove recklessly causing death of a pedestrian.",
        "Culpable homicide during an altercation; accused pushed victim off terrace.",
    ],
    "307": [
        "Attempted murder; accused attacked victim with a sharp weapon.",
        "Poisoning attempt; accused mixed toxic substances in victim's food.",
    ],
    "376": [
        "Sexual assault reported; victim was known to the accused.",
        "Accused committed sexual assault at an isolated location.",
    ],
    "392": [
        "Accused snatched gold chain from victim on a busy road.",
        "Armed robbery at a jewellery shop; three suspects involved.",
    ],
    "395": [
        "Dacoity committed by a gang of five armed individuals.",
        "Group robbery at a rural household; valuables worth lakhs stolen.",
    ],
    "420": [
        "Accused cheated multiple investors through a fake investment scheme.",
        "Financial fraud involving bogus land documents and forged signatures.",
        "Online fraud; accused created fake company and collected deposits.",
    ],
    "379": [
        "Theft of mobile phone from a crowded marketplace.",
        "Accused stole bicycle parked outside a government office.",
    ],
    "380": [
        "Theft committed inside a residential dwelling during daytime.",
        "Accused broke into house and stole cash and jewellery.",
    ],
    "323": [
        "Simple assault during a neighbourhood dispute over parking.",
        "Accused slapped and punched the complainant during an argument.",
    ],
    "324": [
        "Assault with a wooden stick causing injuries to the head.",
        "Accused attacked victim with a broken bottle at a chai stall.",
    ],
    "325": [
        "Grievous hurt caused during a brawl; victim suffered fractures.",
        "Accused beat victim severely causing permanent disability.",
    ],
    "326": [
        "Acid attack on victim; accused threw corrosive substance.",
        "Accused attacked with an axe causing grievous injuries.",
    ],
    "354": [
        "Accused outraged the modesty of a woman on public transport.",
        "Workplace harassment; accused made inappropriate physical contact.",
    ],
    "363": [
        "Child kidnapped from school premises for ransom.",
        "Accused abducted a minor from a religious gathering.",
    ],
    "364": [
        "Kidnapping for ransom; victim held captive for three days.",
        "Organised kidnapping; ransom demand of Rs. 50 lakhs.",
    ],
    "384": [
        "Accused extorted money from shopkeepers threatening violence.",
        "Extortion case; accused demanded monthly hafta from street vendors.",
    ],
    "406": [
        "Criminal breach of trust; accused misappropriated business partner's funds.",
        "Employee embezzled company funds over a period of two years.",
    ],
    "409": [
        "Public servant misappropriated relief funds meant for flood victims.",
        "Government contractor diverted sanctioned materials for personal gain.",
    ],
    "419": [
        "Accused impersonated a government official to cheat villagers.",
        "Identity fraud; accused used forged documents to secure a loan.",
    ],
    "468": [
        "Forgery of degree certificates for securing government employment.",
        "Accused forged property documents to fraudulently sell ancestral land.",
    ],
    "471": [
        "Accused presented forged bank documents for large withdrawal.",
        "Used falsified medical certificates to claim insurance benefits.",
    ],
    "498A": [
        "Domestic violence and cruelty towards wife for additional dowry.",
        "Accused husband and in-laws subjected wife to mental and physical torture.",
    ],
    "506": [
        "Criminal intimidation; accused threatened to harm victim's family.",
        "Accused sent death threats via phone and social media.",
    ],
    "509": [
        "Accused made obscene gestures and remarks towards a woman at workplace.",
        "Eve-teasing incident on public bus; victim complained to police.",
    ],
    "138_NI": [
        "Cheque of Rs. 5,00,000 dishonoured due to insufficient funds.",
        "Business payment cheque bounced; amount Rs. 2,50,000.",
        "Accused issued cheque knowing account had been closed.",
    ],
    "120B": [
        "Criminal conspiracy to commit robbery and extortion.",
        "Accused conspired with others to cheat investors in Ponzi scheme.",
    ],
    "342": [
        "Accused wrongfully confined victim in a room for six hours.",
        "Illegal detention of domestic worker; victim was not allowed to leave.",
    ],
    "308": [
        "Attempted culpable homicide; accused pushed victim in front of a vehicle.",
    ],
}

# ─── District Courts ──────────────────────────────────────────────────
COURTS = [
    "Tis Hazari Courts, Delhi",
    "Saket Courts, Delhi",
    "Patiala House Courts, Delhi",
    "Karkardooma Courts, Delhi",
    "City Civil Court, Mumbai",
    "Sessions Court, Pune",
    "Chief Metropolitan Magistrate Court, Bengaluru",
    "City Criminal Court, Chennai",
    "City Civil and Sessions Court, Hyderabad",
    "Court of Additional Sessions Judge, Lucknow",
    "District Court, Jaipur",
    "Sessions Court, Ahmedabad",
    "Metropolitan Magistrate Court, Kolkata",
    "District and Sessions Court, Chandigarh",
    "District Court, Patna",
]


def random_name():
    """Generate a realistic Indian name."""
    if random.random() < 0.7:
        first = random.choice(FIRST_NAMES_MALE)
    else:
        first = random.choice(FIRST_NAMES_FEMALE)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def random_date(start_year=2018, end_year=2025):
    """Generate a random date between start_year and end_year."""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)


def generate_case(index: int) -> dict:
    """Generate a single synthetic case."""
    section = random.choice(CRIME_SECTIONS)
    case_type = SECTION_TO_TYPE.get(section, "criminal")
    max_sentence = get_max_sentence(section)
    description_options = CRIME_DESCRIPTIONS.get(section, [
        f"Offence under Section {section} of the Indian Penal Code."
    ])
    description = random.choice(description_options)

    # Filing date: older cases are more common for testing
    filing_date = random_date(2018, 2025)

    # Detention start: usually same day or shortly after filing
    detention_offset = random.randint(0, 30)
    detention_start = filing_date + timedelta(days=detention_offset)

    # Some cases won't have detention (non-custodial)
    is_undertrial = random.random() < 0.75
    if not is_undertrial:
        detention_start = None

    # Hearing patterns
    total_hearings = random.randint(1, 40)
    # Ensure some cases have high adjournment rates
    if random.random() < 0.25:
        hearings_held = random.randint(0, max(1, total_hearings // 4))
    else:
        hearings_held = random.randint(
            total_hearings // 2, total_hearings
        )

    # Vulnerability flag — ~20% cases
    vulnerability = 1 if random.random() < 0.20 else 0

    # Build case number like real Indian ones: TYPE/NNNN/YYYY
    year = filing_date.year
    prefix = "CR" if case_type == "criminal" else "CC"
    case_number = f"{prefix}/{1000 + index}/{year}"

    return {
        "case_number": case_number,
        "accused_name": random_name(),
        "crime_section": section,
        "crime_description": description,
        "filing_date": filing_date,
        "detention_start_date": detention_start,
        "max_sentence_years": max_sentence,
        "hearing_count": total_hearings,
        "hearings_held": hearings_held,
        "vulnerability_flag": vulnerability,
        "is_undertrial": is_undertrial,
        "case_type": case_type,
    }


def generate_and_populate(count: int = 300):
    """Generate synthetic cases, compute scores, and insert into database."""
    init_db()
    session = get_session()

    # Clear existing data
    session.query(Case).delete()
    session.commit()

    cases_created = 0
    for i in range(count):
        case_data = generate_case(i)

        # Compute detention days
        detention_days = 0
        if case_data["detention_start_date"]:
            detention_days = (
                datetime.now() - case_data["detention_start_date"]
            ).days
            detention_days = max(detention_days, 0)

        # Compute all scores
        scores = compute_u_score(
            detention_days=detention_days,
            max_sentence_years=case_data["max_sentence_years"],
            filing_date=case_data["filing_date"],
            case_type=case_data["case_type"],
            vulnerability_flag=case_data["vulnerability_flag"],
            crime_section=case_data["crime_section"],
            hearing_count=case_data["hearing_count"],
            hearings_held=case_data["hearings_held"],
        )

        # Create ORM object
        case = Case(
            case_number=case_data["case_number"],
            accused_name=case_data["accused_name"],
            crime_section=case_data["crime_section"],
            crime_description=case_data["crime_description"],
            filing_date=case_data["filing_date"],
            detention_start_date=case_data["detention_start_date"],
            max_sentence_years=case_data["max_sentence_years"],
            hearing_count=case_data["hearing_count"],
            hearings_held=case_data["hearings_held"],
            vulnerability_flag=case_data["vulnerability_flag"],
            is_undertrial=case_data["is_undertrial"],
            case_type=case_data["case_type"],
            u_score=scores["u_score"],
            dsr_score=scores["dsr_score"],
            age_score=scores["age_score"],
            vulnerability_score=scores["vulnerability_score"],
            rights_score=scores["rights_score"],
            severity_score=scores["severity_score"],
            adjournment_score=scores["adjournment_score"],
            priority_level=scores["priority_level"],
        )

        session.add(case)
        cases_created += 1

    session.commit()
    session.close()

    print(f"[DATA] Successfully generated and scored {cases_created} cases.")

    # Print distribution summary
    session = get_session()
    total = session.query(Case).count()
    critical = session.query(Case).filter(Case.priority_level == "CRITICAL").count()
    high = session.query(Case).filter(Case.priority_level == "HIGH").count()
    medium = session.query(Case).filter(Case.priority_level == "MEDIUM").count()
    low = session.query(Case).filter(Case.priority_level == "LOW").count()
    session.close()

    print(f"\n[DISTRIBUTION]")
    print(f"  Total:    {total}")
    print(f"  CRITICAL: {critical}")
    print(f"  HIGH:     {high}")
    print(f"  MEDIUM:   {medium}")
    print(f"  LOW:      {low}")


if __name__ == "__main__":
    print("[DATA] Generating 300 synthetic court cases...")
    generate_and_populate(300)
    print("[DATA] Done.")
