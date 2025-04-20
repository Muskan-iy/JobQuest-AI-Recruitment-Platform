from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
from models import users_collection
from config import Config
from google.oauth2 import id_token
from google.auth.transport import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Signup Endpoint
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data['email']
    password = data['password'].encode('utf-8')
    
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_pw = bcrypt.hashpw(password, bcrypt.gensalt())
    users_collection.insert_one({'email': email, 'password': hashed_pw})
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)