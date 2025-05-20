from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import datetime
import jwt
from functools import wraps
import os
from models import users_collection, profiles_collection, Job, Candidate, TestResult
from config import Config
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object(Config)

# CORS Configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
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
    
    users_collection.insert_one(user_data)
    
    token = create_token(user_data)
    return jsonify({
        'token': token,
        'user': {
            'email': user_data['email'],
            'fullName': user_data['fullName']
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
    
    token = create_token(user)
    return jsonify({
        'token': token,
        'user': {
            'email': user['email'],
            'fullName': user['fullName']
        }
    }), 200

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
        
        # Ensure name is always saved from user data
        if 'name' not in data:
            data['name'] = current_user['fullName']
        
        data['email'] = current_user['email']
        data['updatedAt'] = datetime.datetime.utcnow()
        
        profiles_collection.update_one(
            {'email': current_user['email']},
            {'$set': data},
            upsert=True
        )
        
        # Return the updated profile
        profile = profiles_collection.find_one({'email': current_user['email']})
        profile['_id'] = str(profile['_id'])
        return jsonify(profile), 200

# User Profile Endpoint
@app.route('/api/user/profile', methods=['GET'])
@token_required
def user_profile(current_user):
    profile = profiles_collection.find_one({'email': current_user['email']})
    return jsonify({
        'user': {
            'email': current_user['email'],
            'fullName': current_user['fullName']
        },
        'profile': profile if profile else None
    }), 200

@app.route('/api/jobs', methods=['POST'])
def create_job():
    try:
        data = request.get_json()
        if not all(key in data for key in ['title', 'description', 'required_skills', 'eq_requirement', 'iq_requirement', 'recruiter_id']):
            return jsonify({'error': 'Missing required fields'}), HTTPStatus.BAD_REQUEST

        new_job = Job(
            title=data['title'],
            description=data['description'],
            required_skills=data['required_skills'],
            eq_requirement=data['eq_requirement'],
            iq_requirement=data['iq_requirement'],
            recruiter_id=data['recruiter_id']
        )
        db.session.add(new_job)
        db.session.commit()
        return jsonify({'message': 'Job created successfully'}), HTTPStatus.CREATED
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/api/candidates', methods=['POST'])
def upload_cv():
    cv_file = request.files['cv']
    # Process CV to extract skills (you'll need a CV parser library)
    skills = extract_skills_from_cv(cv_file)
    
    new_candidate = Candidate(
        name=request.form['name'],
        cv_path=save_cv_file(cv_file),
        skills=skills
    )
    db.session.add(new_candidate)
    db.session.commit()
    return jsonify({'message': 'CV processed successfully'}), 201

@app.route('/api/tests', methods=['POST'])
def save_test_results():
    data = request.get_json()
    new_result = TestResult(
        candidate_id=data['candidate_id'],
        eq_score=data['eq_score'],
        iq_score=data['iq_score']
    )
    db.session.add(new_result)
    db.session.commit()
    
    # Update candidate's scores
    candidate = Candidate.query.get(data['candidate_id'])
    candidate.eq_score = data['eq_score']
    candidate.iq_score = data['iq_score']
    db.session.commit()
    
    return jsonify({'message': 'Test results saved successfully'}), 201

@app.route('/api/matches/<int:candidate_id>', methods=['GET'])
def get_matches(candidate_id):
    candidate = Candidate.query.get_or_404(candidate_id)
    jobs = Job.query.all()
    
    matches = []
    for job in jobs:
        # Basic matching logic (can be enhanced)
        skill_match = len(set(candidate.skills) & set(job.required_skills)) / len(job.required_skills)
        eq_match = candidate.eq_score >= job.eq_requirement if job.eq_requirement else True
        iq_match = candidate.iq_score >= job.iq_requirement if job.iq_requirement else True
        
        if skill_match > 0.5 and eq_match and iq_match:
            matches.append({
                'job_id': job.id,
                'title': job.title,
                'match_score': skill_match * 100,
                'eq_match': eq_match,
                'iq_match': iq_match
            })
    
    return jsonify({'matches': matches})

if __name__ == '__main__':
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=5001)