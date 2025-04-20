from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
from models import users_collection
from config import Config
from google.oauth2 import id_token
from google.auth.transport import requests
import datetime
from pymongo import MongoClient
import secrets
import string
from flask_mail import Mail, Message

client = MongoClient("mongodb://localhost:27017/")

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Email Configuration (Update with your SMTP settings)
app.config['MAIL_SERVER'] = 'smtp.example.com'  # e.g., 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your_email@example.com'
app.config['MAIL_PASSWORD'] = 'your_email_password'
app.config['MAIL_DEFAULT_SENDER'] = 'your_email@example.com'

mail = Mail(app)

# Password Reset Token Collection
password_reset_tokens = client['your_database_name']['password_reset_tokens']

def generate_token():
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

# Signup Endpoint
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('fullName')
    phone_number = data.get('phoneNumber')
    
    if not all([email, password, full_name, phone_number]):
        return jsonify({'error': 'All fields are required'}), 400
    
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users_collection.insert_one({
        'email': email,
        'password': hashed_pw,
        'fullName': full_name,
        'phoneNumber': phone_number,
        'createdAt': datetime.datetime.utcnow()  
    })
    return jsonify({'message': 'Signup successful'}), 201

# Login Endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password'].encode('utf-8')
    
    user = users_collection.find_one({'email': email})
    if user and bcrypt.checkpw(password, user['password']):
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

# Google Login Endpoint
@app.route('/api/google-login', methods=['POST'])
def google_login():
    token = request.json['token']
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), Config.GOOGLE_CLIENT_ID)
        email = idinfo['email']
        if not users_collection.find_one({'email': email}):
            users_collection.insert_one({'email': email, 'google_login': True})
        return jsonify({'message': 'Google login successful'}), 200
    except ValueError:
        return jsonify({'error': 'Invalid token'}), 400

# Forgot Password Endpoint
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({'message': 'If this email exists, a reset link has been sent'}), 200
    
    # Generate and store token
    token = generate_token()
    password_reset_tokens.insert_one({
        'email': email,
        'token': token,
        'createdAt': datetime.datetime.utcnow(),
        'expiresAt': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    })
    
    # In development, print the token to console instead of sending email
    if app.debug:
        print(f"Password reset token for {email}: {token}")
        return jsonify({
            'message': 'Development mode - Token printed to console',
            'token': token  # Only for development!
        }), 200
    
    # In production, send actual email
    try:
        msg = Message('Password Reset Request',
                     recipients=[email])
        msg.body = f'Click to reset your password: http://localhost:3000/reset-password?token={token}'
        mail.send(msg)
        return jsonify({'message': 'Password reset link sent'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Reset Password Endpoint
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('newPassword')
    
    if not all([token, new_password]):
        return jsonify({'error': 'Token and new password are required'}), 400
    
    # Find and validate token
    reset_request = password_reset_tokens.find_one({
        'token': token,
        'expiresAt': {'$gt': datetime.datetime.utcnow()}
    })
    
    if not reset_request:
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    # Update password
    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    users_collection.update_one(
        {'email': reset_request['email']},
        {'$set': {'password': hashed_pw}}
    )
    
    # Delete used token
    password_reset_tokens.delete_one({'token': token})
    
    return jsonify({'message': 'Password updated successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)