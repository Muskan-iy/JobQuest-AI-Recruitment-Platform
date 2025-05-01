import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database Configuration
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DB_NAME = os.getenv("DB_NAME", "auth_db") 
    
    # Authentication
    SECRET_KEY = os.getenv("SECRET_KEY") 
    TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", 1440)) 
    
    # Google OAuth (corrected environment variable names)
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")  
    
    # File Uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    ALLOWED_EXTENSIONS = {'pdf'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")