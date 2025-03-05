import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # SQLAlchemy Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Secret Key for sessions
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # Debug Settings
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max file upload
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @classmethod
    def validate(cls):
        """
        Validate that critical configuration values are set.
        Raises ValueError if any critical configuration is missing.
        """
        errors = []
        
        if not cls.SECRET_KEY:
            errors.append("SECRET_KEY must be set in .env file")
        
        if not cls.JWT_SECRET_KEY:
            errors.append("JWT_SECRET_KEY must be set in .env file")
        
        if errors:
            raise ValueError("\n".join(errors))
        
        return True