from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError
import bcrypt
import datetime
import jwt
from functools import wraps
from http import HTTPStatus
from io import BytesIO
from pymongo import MongoClient
from config import Config
from sqlalchemy import inspect
from database import db
from models import Job, Candidate, TestResult, JobApplication

app = Flask(__name__)
app.config.from_object(Config)

# Initialize SQLAlchemy
db.init_app(app)

# Create database tables
with app.app_context():
    try:
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        print(f"Using database file: {db_path}")
        db.create_all()
        tables = inspect(db.engine).get_table_names()
        print(f"Database tables created: {tables}")
        if not all(table in tables for table in ['candidate', 'job', 'job_application', 'test_result']):
            print("Warning: Some required tables not created. Recreating...")
            db.drop_all()
            db.create_all()
            tables = inspect(db.engine).get_table_names()
            print(f"Recreated tables: {tables}")
            if not all(table in tables for table in ['candidate', 'job', 'job_application', 'test_result']):
                print("Error: Failed to create required tables")
                exit(1)
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        exit(1)

# Initialize MongoDB
mongo_client = MongoClient(Config.MONGO_URI)
mongo_db = mongo_client[Config.DB_NAME]
users_collection = mongo_db['users']
profiles_collection = mongo_db['profiles']
tokens_collection = mongo_db['tokens']

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT Helper Functions
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
            return jsonify({'error': 'Token is missing'}), HTTPStatus.UNAUTHORIZED
        
        if tokens_collection.find_one({'token': token}):
            return jsonify({'error': 'Token is invalid or expired'}), HTTPStatus.UNAUTHORIZED
        
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = users_collection.find_one({'email': data['email']})
            if not current_user:
                return jsonify({'error': 'User not found'}), HTTPStatus.UNAUTHORIZED
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), HTTPStatus.UNAUTHORIZED
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), HTTPStatus.UNAUTHORIZED
        
        return f(current_user, *args, **kwargs)
    return decorated

# Authentication Endpoints
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        required_fields = ['email', 'password', 'fullName']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), HTTPStatus.BAD_REQUEST
        
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'User already exists'}), HTTPStatus.BAD_REQUEST
        
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
        }), HTTPStatus.CREATED
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': f'Signup failed: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), HTTPStatus.BAD_REQUEST
        
        user = users_collection.find_one({'email': data['email']})
        if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            return jsonify({'error': 'Invalid credentials'}), HTTPStatus.UNAUTHORIZED
        
        user['_id'] = str(user['_id'])
        token = create_token(user)
        return jsonify({
            'token': token,
            'user': {
                'email': user['email'],
                'fullName': user['fullName'],
                '_id': user['_id']
            }
        }), HTTPStatus.OK
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': f'Login failed: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token is missing'}), HTTPStatus.BAD_REQUEST
        
        token = auth_header.split(" ")[1]
        print(f"Received token: {token}")
        
        if tokens_collection.find_one({'token': token}):
            return jsonify({'error': 'Token is already invalid or expired'}), HTTPStatus.BAD_REQUEST
        
        try:
            token_data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
            expiry = datetime.datetime.fromtimestamp(token_data['exp'])
            user_email = token_data['email']
            print(f"Decoded token: email={user_email}, expiry={expiry}")
        except jwt.InvalidTokenError as e:
            print(f"Invalid token error: {str(e)}")
            return jsonify({'error': 'Invalid token'}), HTTPStatus.BAD_REQUEST
        
        tokens_collection.insert_one({
            'token': token,
            'user_email': user_email,
            'blacklisted_at': datetime.datetime.utcnow(),
            'expires_at': expiry
        })
        print(f"Token blacklisted for user: {user_email}")
        
        return jsonify({'message': 'Logged out successfully'}), HTTPStatus.OK
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'error': f'Logout failed: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Profile Endpoints
@app.route('/api/profile', methods=['GET', 'POST', 'PUT'])
@token_required
def profile(current_user):
    try:
        if request.method == 'GET':
            profile = profiles_collection.find_one({'email': current_user['email']})
            if profile:
                profile['_id'] = str(profile['_id'])
                return jsonify(profile), HTTPStatus.OK
            return jsonify({'error': 'Profile not found'}), HTTPStatus.NOT_FOUND
        
        elif request.method in ['POST', 'PUT']:
            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), HTTPStatus.BAD_REQUEST
            
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
            return jsonify(profile), HTTPStatus.OK
    except Exception as e:
        print(f"Profile error: {str(e)}")
        return jsonify({'error': f'Profile operation failed: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/api/user/profile', methods=['GET'])
@token_required
def user_profile(current_user):
    try:
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
        }), HTTPStatus.OK
    except Exception as e:
        print(f"User profile error: {str(e)}")
        return jsonify({'error': f'Failed to fetch user profile: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

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
        return jsonify({'message': 'Job created successfully', 'job_id': new_job.id}), HTTPStatus.CREATED
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except ValueError as e:
        return jsonify({'error': f'Invalid data: {str(e)}'}), HTTPStatus.BAD_REQUEST
    except Exception as e:
        print(f"Job creation error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# CV Upload Endpoint
@app.route('/api/candidates', methods=['POST'])
@token_required
def upload_cv(current_user):
    print(f"Received request to /api/candidates at {datetime.datetime.utcnow()}")
    try:
        if 'cv' not in request.files or 'name' not in request.form or 'cv_data' not in request.form:
            print("Missing CV file, name, or CV data")
            return jsonify({'error': 'Missing CV file, name, or CV data'}), HTTPStatus.BAD_REQUEST
        
        cv_file = request.files['cv']
        name = request.form['name']
        user_id = str(current_user['_id'])
        cv_data = request.form['cv_data']
        import json
        extracted_data = json.loads(cv_data)
        
        print(f"Processing CV for {name}, file: {cv_file.filename}")
        
        cv_binary = cv_file.stream.read()
        
        new_candidate = Candidate(
            user_id=user_id,
            name=name,
            cv_data=cv_binary,
            cv_filename=cv_file.filename,
            skills=extracted_data.get('skills', []),
            experience=extracted_data.get('experience', []),
            education=extracted_data.get('education', []),
            projects=extracted_data.get('projects', []),
            suggested_career_paths=extracted_data.get('suggested_career_paths', []),
            detected_profession=extracted_data.get('detected_profession', ''),
            email=extracted_data.get('email', ''),
            contact_number=extracted_data.get('contact_number', ''),
            created_at=datetime.datetime.utcnow()
        )
        db.session.add(new_candidate)
        db.session.commit()
        print("CV processed and saved to database")
        return jsonify({
            'message': 'CV processed successfully',
            'candidate_id': new_candidate.id
        }), HTTPStatus.CREATED
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Candidate Data Endpoint
@app.route('/api/candidates/<user_id>', methods=['GET'])
@token_required
def get_candidate(current_user, user_id):
    print(f"Received request to /api/candidates/{user_id} at {datetime.datetime.utcnow()}")
    try:
        if str(current_user['_id']) != user_id:
            print("Unauthorized: Not the candidate")
            return jsonify({'error': 'Unauthorized'}), HTTPStatus.UNAUTHORIZED

        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate:
            print("Candidate not found")
            return jsonify({'error': 'Candidate not found'}), HTTPStatus.NOT_FOUND

        candidate_data = {
            'id': candidate.id,
            'name': candidate.name,
            'email': candidate.email,
            'contact_number': candidate.contact_number,
            'skills': candidate.skills,
            'experience': candidate.experience,
            'education': candidate.education,
            'projects': candidate.projects,
            'suggested_career_paths': candidate.suggested_career_paths,
            'detected_profession': candidate.detected_profession,
            'eq_score': candidate.eq_score,
            'iq_score': candidate.iq_score,
            'created_at': candidate.created_at.isoformat()
        }
        print(f"Retrieved candidate data for user_id: {user_id}")
        return jsonify(candidate_data), HTTPStatus.OK
    except SQLAlchemyError as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Job Application Endpoint
@app.route('/api/apply', methods=['POST'])
@token_required
def apply_job(current_user):
    print(f"Received request to /api/apply at {datetime.datetime.utcnow()}")
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        user_id = str(current_user['_id'])
        
        if not job_id:
            print("Missing job_id")
            return jsonify({'error': 'Missing job_id'}), HTTPStatus.BAD_REQUEST
        
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate:
            print("No candidate profile found")
            return jsonify({'error': 'No candidate profile found'}), HTTPStatus.BAD_REQUEST
        
        job = Job.query.get(job_id)
        if not job:
            print("Job not found")
            return jsonify({'error': 'Job not found'}), HTTPStatus.NOT_FOUND
        
        existing_application = JobApplication.query.filter_by(job_id=job_id, candidate_id=candidate.id).first()
        if existing_application:
            print("Candidate has already applied for this job")
            return jsonify({'error': 'You have already applied for this job'}), HTTPStatus.BAD_REQUEST
        
        application = JobApplication(
            job_id=job_id,
            candidate_id=candidate.id,
            applied_at=datetime.datetime.utcnow()
        )
        db.session.add(application)
        db.session.commit()
        print(f"Application for job {job_id} saved")
        return jsonify({'message': 'Application submitted successfully'}), HTTPStatus.CREATED
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Recruiter View Applications Endpoint
@app.route('/api/job_applications/<int:job_id>', methods=['GET'])
@token_required
def get_job_applications(current_user, job_id):
    print(f"Received request to /api/job_applications/{job_id} at {datetime.datetime.utcnow()}")
    try:
        job = Job.query.get_or_404(job_id)
        if job.recruiter_id != int(str(current_user['_id'])):
            print("Unauthorized: Not the job's recruiter")
            return jsonify({'error': 'Unauthorized'}), HTTPStatus.UNAUTHORIZED
        
        applications = JobApplication.query.filter_by(job_id=job_id).all()
        result = []
        for app in applications:
            candidate = Candidate.query.get(app.candidate_id)
            result.append({
                'candidate_id': candidate.id,
                'name': candidate.name,
                'skills': candidate.skills,
                'experience': candidate.experience,
                'education': candidate.education,
                'projects': candidate.projects,
                'suggested_career_paths': candidate.suggested_career_paths,
                'detected_profession': candidate.detected_profession,
                'email': candidate.email,
                'contact_number': candidate.contact_number,
                'cv_filename': candidate.cv_filename,
                'applied_at': app.applied_at.isoformat()
            })
        print(f"Retrieved {len(result)} applications for job {job_id}")
        return jsonify({'applications': result}), HTTPStatus.OK
    except SQLAlchemyError as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Download CV Endpoint
@app.route('/api/candidates/<int:candidate_id>/cv', methods=['GET'])
@token_required
def get_cv(current_user, candidate_id):
    print(f"Received request to /api/candidates/{candidate_id}/cv at {datetime.datetime.utcnow()}")
    try:
        candidate = Candidate.query.get_or_404(candidate_id)
        user_id = str(current_user['_id'])
        job_application = JobApplication.query.filter_by(candidate_id=candidate.id).first()
        if not job_application:
            if candidate.user_id != user_id:
                print("Unauthorized: Not the candidate and no job application found")
                return jsonify({'error': 'Unauthorized'}), HTTPStatus.UNAUTHORIZED
        else:
            job = Job.query.get(job_application.job_id)
            if candidate.user_id != user_id and job.recruiter_id != int(user_id):
                print("Unauthorized: Not the candidate or the job's recruiter")
                return jsonify({'error': 'Unauthorized'}), HTTPStatus.UNAUTHORIZED
        
        return send_file(
            BytesIO(candidate.cv_data),
            download_name=candidate.cv_filename,
            as_attachment=True
        )
    except SQLAlchemyError as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Error serving CV: {str(e)}")
        return jsonify({'error': f'Failed to retrieve CV: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Save Test Results Endpoint
@app.route('/api/tests', methods=['POST'])
def save_test_results():
    print(f"Received request to /api/tests at {datetime.datetime.utcnow()}")
    try:
        data = request.get_json()
        required_fields = ['candidate_id', 'eq_score', 'iq_score']
        if not all(key in data for key in required_fields):
            print("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), HTTPStatus.BAD_REQUEST
        
        new_result = TestResult(
            candidate_id=data['candidate_id'],
            eq_score=data['eq_score'],
            iq_score=data['iq_score']
        )
        db.session.add(new_result)
        
        candidate = Candidate.query.get(data['candidate_id'])
        if not candidate:
            print("Candidate not found")
            return jsonify({'error': 'Candidate not found'}), HTTPStatus.NOT_FOUND
        candidate.eq_score = data['eq_score']
        candidate.iq_score = data['iq_score']
        db.session.commit()
        
        print("Test results saved successfully")
        return jsonify({'message': 'Test results saved successfully'}), HTTPStatus.CREATED
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Get Test Results Endpoint
@app.route('/api/tests/<int:candidate_id>', methods=['GET'])
@token_required
def get_test_results(current_user, candidate_id):
    print(f"Received request to /api/tests/{candidate_id} at {datetime.datetime.utcnow()}")
    try:
        candidate = Candidate.query.get_or_404(candidate_id)
        if candidate.user_id != str(current_user['_id']):
            print("Unauthorized: Not the candidate")
            return jsonify({'error': 'Unauthorized'}), HTTPStatus.UNAUTHORIZED

        test_results = TestResult.query.filter_by(candidate_id=candidate_id).all()
        results = [
            {
                'id': result.id,
                'title': f"Test {result.id}",
                'score': f"{result.eq_score + result.iq_score}/200" if result.eq_score and result.iq_score else "N/A",
                'date': result.created_at.isoformat(),
                'skillsTested': candidate.skills if candidate.skills else [],
                'feedback': "Test feedback placeholder"
            }
            for result in test_results
        ]
        print(f"Retrieved {len(results)} test results for candidate {candidate_id}")
        return jsonify({'tests': results}), HTTPStatus.OK
    except SQLAlchemyError as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

# Job Matching Endpoint
@app.route('/api/matches/<int:candidate_id>', methods=['GET'])
def get_matches(candidate_id):
    print(f"Received request to /api/matches/{candidate_id} at {datetime.datetime.utcnow()}")
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
        
        print(f"Found {len(matches)} job matches for candidate {candidate_id}")
        return jsonify({'matches': matches}), HTTPStatus.OK
    except SQLAlchemyError as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), HTTPStatus.INTERNAL_SERVER_ERROR

if __name__ == '__main__':
    print("Starting Flask server on port 5001...")
    print("Note: To avoid socket errors on Windows, run with: python app.py --no-reload")
    app.run(debug=True, port=5001)