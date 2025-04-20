import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/auth_db")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    GOOGLE_CLIENT_ID = os.getenv("456136399519-klvejo6unfhmv62qas655hq6ip13ar4b.apps.googleusercontent.com")
    GOOGLE_CLIENT_SECRET = os.getenv("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")