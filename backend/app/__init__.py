import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from config import Config
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

import logging
import os

def setup_logging(app):
    """Configure logging for the application"""
    # Ensure log directory exists
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)
    
    # Create a formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # File handler with rotation-like behavior
    file_handler = logging.FileHandler(os.path.join(log_dir, 'app.log'))
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    
    # Clear existing handlers to prevent duplicate logs
    app.logger.handlers.clear()
    
    # Add handlers
    app.logger.addHandler(console_handler)
    app.logger.addHandler(file_handler)
    
    # Set the overall logging level
    app.logger.setLevel(logging.INFO)
    
    # Optional: Disable Flask's default app.logger to prevent duplicate logs
    logging.getLogger('werkzeug').disabled = True

def create_app():
    # Create Flask app
    app = Flask(__name__)
    
    # Setup logging
    setup_logging(app)
    
    # Validate configuration
    try:
        Config.validate()
    except ValueError as e:
        # Log the error
        app.logger.error(f"Configuration Validation Error: {e}")
        # In a production app, you might want to handle this more gracefully
        raise
    
    # Set the configuration
    app.config.from_object(Config)
    
    # Comprehensive CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5000",
                "http://127.0.0.1:5000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": [
                "Content-Type", 
                "Authorization", 
                "Access-Control-Allow-Credentials"
            ]
        }
    }, supports_credentials=True)
    
    # Additional configs for file upload
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file upload
    app.config['UPLOAD_FOLDER'] = 'uploads'  # Temporary upload directory
    
    
    
    # Initialize database
    db.init_app(app)
    migrate.init_app(app, db)
    
    # --------- { Commented out this part coz it re-creates tables repeatedly after each execution } ---------
    # # Create database tables
    # with app.app_context():
    #     try:
    #         db.create_all()
    #         app.logger.info("Database tables created successfully")
    #     except Exception as e:
    #         app.logger.error(f"Error creating database tables: {e}")
    
    # Initialize Firebase
    try:
        cred = credentials.Certificate('firebase_credentials.json')
        firebase_admin.initialize_app(cred)
        app.logger.info("Firebase initialized successfully")
    except Exception as e:
        app.logger.error(f"Firebase initialization error: {e}")
    
    # Register existing blueprints
    from .routes.auth import auth_bp
    from .routes.user import user_bp
    from .routes.detection_routes import detection_routes
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(detection_routes, url_prefix='/api/ml')
    
    # Add error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        app.logger.error(f"404 error: {error}")
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"500 error: {error}")
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}, 200
    
    return app