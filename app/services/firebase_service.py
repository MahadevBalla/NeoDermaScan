import firebase_admin
from firebase_admin import auth, credentials
import logging

class FirebaseService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            try:
                # Initialize Firebase Admin SDK
                cred = credentials.Certificate('firebase_credentials.json')
                firebase_admin.initialize_app(cred)
                cls._instance = super(FirebaseService, cls).__new__(cls)
            except Exception as e:
                logging.error(f"Firebase initialization error: {e}")
                raise
        return cls._instance

    def verify_firebase_token(self, id_token):
        """
        Verify and decode Firebase ID token
        
        Args:
            id_token (str): Firebase ID token to verify
        
        Returns:
            dict: Decoded token information
        
        Raises:
            ValueError: If token is invalid
        """
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except (ValueError, auth.InvalidIdTokenError) as e:
            logging.error(f"Token verification failed: {e}")
            raise ValueError("Invalid Firebase token")

    def get_user_by_firebase_uid(self, uid):
        """
        Retrieve Firebase user by UID
        
        Args:
            uid (str): Firebase user ID
        
        Returns:
            auth.UserRecord: Firebase user record
        """
        try:
            return auth.get_user(uid)
        except Exception as e:
            logging.error(f"Error fetching user: {e}")
            return None

    def create_custom_token(self, uid, additional_claims=None):
        """
        Create a custom authentication token
        
        Args:
            uid (str): User's Firebase UID
            additional_claims (dict, optional): Extra authentication claims
        
        Returns:
            str: Custom authentication token
        """
        try:
            return auth.create_custom_token(uid, additional_claims)
        except Exception as e:
            logging.error(f"Error creating custom token: {e}")
            return None

# Singleton instance for easy import and use
firebase_service = FirebaseService()