from pymongo import MongoClient
from config import Config
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Database Connection
client = MongoClient(Config.MONGO_URI)
db = client['auth_db']

# Collections
users_collection = db['users']
profiles_collection = db['profiles']
tokens_collection = db['tokens']  # For token blacklisting if needed

# Indexes (create if not exists)
users_collection.create_index("email", unique=True)
profiles_collection.create_index("email", unique=True)

db = SQLAlchemy()

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.String(255)) # Likely a string
    eq_requirement = db.Column(db.String(255), nullable=True)
    iq_requirement = db.Column(db.String(255), nullable=True)
    recruiter_id = db.Column(db.Integer, nullable=False)

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cv_path = db.Column(db.String(255), nullable=False)
    skills = db.Column(db.JSON, nullable=False)  # Extracted skills from CV
    eq_score = db.Column(db.Integer)
    iq_score = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    eq_score = db.Column(db.Integer, nullable=False)
    iq_score = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)