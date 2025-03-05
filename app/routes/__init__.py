# This file can be used to import and register blueprints
# Currently, blueprints are imported directly in app/__init__.py
# But this can be useful for complex routing setups

from .auth import auth_bp
from .user import user_bp

__all__ = ['auth_bp', 'user_bp', 'detection_routes']