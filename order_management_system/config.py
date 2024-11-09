import os
from dotenv import load_dotenv  # Optional if using .env

load_dotenv()  # Loads environment variables from a .env file, if it exists

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security configurations
    SECRET_KEY = os.getenv('SECRET_KEY', 'supersecretkey')  # Ensure you set a strong key in production
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = 86400

    # CSRF and input validation
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = os.getenv('WTF_CSRF_SECRET_KEY', 'anothersecretkey')

    # Additional configurations
    UPLOAD_FOLDER = './uploads'
    ALLOWED_DOMAINS = ['example.com', 'trusted-cdn.com']
