# models.py
from datetime import datetime
from database import db  # Import db from database.py

class Job(db.Model):
    __tablename__ = 'job'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.String(255))
    eq_requirement = db.Column(db.String(255), nullable=True)
    iq_requirement = db.Column(db.String(255), nullable=True)
    recruiter_id = db.Column(db.Integer, nullable=False)

class Candidate(db.Model):
    __tablename__ = 'candidate'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    cv_data = db.Column(db.LargeBinary, nullable=False)
    cv_filename = db.Column(db.String(255), nullable=False)
    skills = db.Column(db.PickleType, nullable=True)
    experience = db.Column(db.PickleType, nullable=True)
    education = db.Column(db.PickleType, nullable=True)
    projects = db.Column(db.PickleType, nullable=True)
    suggested_career_paths = db.Column(db.PickleType, nullable=True)
    detected_profession = db.Column(db.String(255), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    contact_number = db.Column(db.String(50), nullable=True)
    eq_score = db.Column(db.Integer, nullable=True)
    iq_score = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class TestResult(db.Model):
    __tablename__ = 'test_result'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    eq_score = db.Column(db.Integer, nullable=False)
    iq_score = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

class JobApplication(db.Model):
    __tablename__ = 'job_application'
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)