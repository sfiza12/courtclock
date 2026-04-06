import sys
import os
import bcrypt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_session, User, init_db

def seed_user():
    init_db()
    session = get_session()
    email = "judge@court.gov.in"
    password = "password123"

    existing = session.query(User).filter_by(email=email).first()
    if not existing:
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        u = User(email=email, password_hash=hashed, role="judge")
        session.add(u)
        session.commit()
        print(f"\n✅ User created!\nEmail: {email}\nPassword: {password}")
    else:
        print(f"\n⚠️ User already exists!\nEmail: {email}")
    session.close()

if __name__ == "__main__":
    seed_user()
