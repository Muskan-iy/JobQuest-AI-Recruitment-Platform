from pymongo import MongoClient
from config import Config

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