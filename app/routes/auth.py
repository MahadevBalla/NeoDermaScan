from flask import Blueprint, request, jsonify
from firebase_admin import auth
from ..models.user import User
from .. import db
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Verify Firebase token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'error': 'Authorization header missing',
                'success': False
            }), 401

        id_token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(id_token)
        
        # Extract user details
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = request.json.get('name')
        
        # Validate input
        if not uid or not email:
            return jsonify({
                'error': 'Missing required user information',
                'success': False
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(firebase_uid=uid).first()
        if existing_user:
            return jsonify({
                'message': 'User already exists',
                'user_id': existing_user.id,
                'success': True
            }), 200
        
        # Create new user
        new_user = User(
            firebase_uid=uid,
            email=email,
            name=name
        )
        
        db.session.add(new_user)
        
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({
                'error': 'User registration failed due to database constraint',
                'success': False
            }), 409
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': new_user.id,
            'success': True
        }), 201
    
    except auth.InvalidIdTokenError:
        return jsonify({
            'error': 'Invalid Firebase token',
            'success': False
        }), 401
    
    except Exception as e:
        # Log the full error for server-side debugging
        print(f"Registration Error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'success': False
        }), 500