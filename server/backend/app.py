# app.py (complete file with logout endpoint added)
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
import bcrypt
import datetime
import jwt
from functools import wraps
import os
from http import HTTPStatus
from models import users_collection, profiles_collection, tokens_collection, Job, Candidate, TestResult
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# CORS Configuration
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT Helpers
def create_token(user):
    token_data = {
        'email': user['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=Config.TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(token_data, Config.SECRET_KEY, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
            
        # Check if token is blacklisted
        if tokens_collection.find_one({'token': token}):
            return jsonify({'error': 'Token is invalid or expired'}), 401
            
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = users_collection.find_one({'email': data['email']})
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# Auth Endpoints
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    required_fields = ['email', 'password', 'fullName']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    user_data = {
        'email': data['email'],
        'password': hashed_pw,
        'fullName': data['fullName'],
        'createdAt': datetime.datetime.utcnow(),
        'updatedAt': datetime.datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    user_data['_id'] = str(result.inserted_id)
    
    token = create_token(user_data)
    return jsonify({
        'token': token,
        'user': {
            'email': user_data['email'],
            'fullName': user_data['fullName'],
            '_id': user_data['_id']
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    user = users_collection.find_one({'email': data['email']})
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user['_id'] = str(user['_id'])
    token = create_token(user)
    return jsonify({
        'token': token,
        'user': {
            'email': user['email'],
            'fullName': user['fullName'],
            '_id': user['_id']
        }
    }), 200

# Logout Endpoint
@app.route('/api/logout', methods=['POST'])
@token_required
def logout(current_user):
    try:
        token = request.headers.get('Authorization').split(" ")[1]
        # Decode token to get expiration time
        token_data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
        expiry = datetime.datetime.fromtimestamp(token_data['exp'])
        
        # Blacklist token in tokens_collection
        tokens_collection.insert_one({
            'token': token,
            'user_email': current_user['email'],
            'blacklisted_at': datetime.datetime.utcnow(),
            'expires_at': expiry
        })
        
        return jsonify({'message': 'Logged out successfully'}), HTTPStatus.OK
    except Exception as e:
        return jsonify({'error': f'Logout failed: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Profile Endpoints
@app.route('/api/profile', methods=['GET', 'POST', 'PUT'])
@token_required
def profile(current_user):
    if request.method == 'GET':
        profile = profiles_collection.find_one({'email': current_user['email']})
        if profile:
            profile['_id'] = str(profile['_id'])
            return jsonify(profile), 200
        return jsonify({'error': 'Profile not found'}), 404
    
    elif request.method in ['POST', 'PUT']:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'name' not in data:
            data['name'] = current_user['fullName']
        
        data['email'] = current_user['email']
        data['updatedAt'] = datetime.datetime.utcnow()
        
        profiles_collection.update_one(
            {'email': current_user['email']},
            {'$set': data},
            upsert=True
        )
        
        profile = profiles_collection.find_one({'email': current_user['email']})
        profile['_id'] = str(profile['_id'])
        return jsonify(profile), 200

@app.route('/api/user/profile', methods=['GET'])
@token_required
def user_profile(current_user):
    profile = profiles_collection.find_one({'email': current_user['email']})
    if profile:
        profile['_id'] = str(profile['_id'])
    return jsonify({
        'user': {
            'email': current_user['email'],
            'fullName': current_user['fullName'],
            '_id': str(current_user['_id'])
        },
        'profile': profile if profile else None
    }), 200

# Job Creation Endpoint
@app.route('/api/jobs', methods=['POST'])
@token_required
def create_job(current_user):
    try:
        data = request.get_json()
        required_fields = ['title', 'description', 'required_skills']
        if not all(key in data for key in required_fields):
            return jsonify({'error': 'Missing required fields'}), HTTPStatus.BAD_REQUEST

        new_job = Job(
            title=data['title'],
            description=data['description'],
            required_skills=data['required_skills'],
            eq_requirement=data.get('eq_requirement', ''),
            iq_requirement=data.get('iq_requirement', ''),
            recruiter_id=int(str(current_user['_id']))
        )
        db.session.add(new_job)
        db.session.commit()
        return jsonify({'message': 'Job created successfully'}), HTTPStatus.CREATED
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except ValueError as e:
        return jsonify({'error': f'Invalid data: {str(e)}'}), HTTPStatus.BAD_REQUEST
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# CV Upload Endpoint
@app.route('/api/candidates', methods=['POST'])
def upload_cv():
    try:
        if 'cv' not in request.files or 'name' not in request.form:
            return jsonify({'error': 'Missing CV file or name'}), HTTPStatus.BAD_REQUEST
        
        cv_file = request.files['cv']
        name = request.form['name']
        
        skills = extract_skills_from_cv(cv_file)
        cv_path = save_cv_file(cv_file)
        
        new_candidate = Candidate(
            name=name,
            cv_path=cv_path,
            skills=skills
        )
        db.session.add(new_candidate)
        db.session.commit()
        return jsonify({'message': 'CV processed successfully'}), HTTPStatus.CREATED
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Save Test Results Endpoint
@app.route('/api/tests', methods=['POST'])
def save_test_results():
    try:
        data = request.get_json()
        required_fields = ['candidate_id', 'eq_score', 'iq_score']
        if not all(key in data for key in required_fields):
            return jsonify({'error': 'Missing required fields'}), HTTPStatus.BAD_REQUEST
        
        new_result = TestResult(
            candidate_id=data['candidate_id'],
            eq_score=data['eq_score'],
            iq_score=data['iq_score']
        )
        db.session.add(new_result)
        
        candidate = Candidate.query.get(data['candidate_id'])
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), HTTPStatus.NOT_FOUND
        candidate.eq_score = data['eq_score']
        candidate.iq_score = data['iq_score']
        db.session.commit()
        
        return jsonify({'message': 'Test results saved successfully'}), HTTPStatus.CREATED
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Job Matching Endpoint
@app.route('/api/matches/<int:candidate_id>', methods=['GET'])
def get_matches(candidate_id):
    try:
        candidate = Candidate.query.get_or_404(candidate_id)
        jobs = Job.query.all()
        
        matches = []
        for job in jobs:
            job_skills = job.required_skills.split(',') if job.required_skills else []
            candidate_skills = candidate.skills if isinstance(candidate.skills, list) else []
            
            skill_match = len(set(candidate_skills) & set(job_skills)) / len(job_skills) if job_skills else 0
            eq_match = (candidate.eq_score >= int(job.eq_requirement) if job.eq_requirement and candidate.eq_score is not None else True)
            iq_match = (candidate.iq_score >= int(job.iq_requirement) if job.iq_requirement and candidate.iq_score is not None else True)
            
            if skill_match > 0.5 and eq_match and iq_match:
                matches.append({
                    'job_id': job.id,
                    'title': job.title,
                    'match_score': skill_match * 100,
                    'eq_match': eq_match,
                    'iq_match': iq_match
                })
        
        return jsonify({'matches': matches}), HTTPStatus.OK
    except SQLAlchemyError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

if __name__ == '__main__':
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)