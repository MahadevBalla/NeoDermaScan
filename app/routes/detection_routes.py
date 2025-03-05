import os
import logging
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
from app.models.detection_model import load_model, predict_melanoma

# Configure logging
logger = logging.getLogger(__name__)

# Create a blueprint for detection routes
detection_routes = Blueprint('detection', __name__)

# Load the model once when the server starts
try:
    MODEL = load_model()
    logger.info("ML Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load ML model: {e}")
    MODEL = None

# Configure upload directory
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Create uploads folder path in the backend root
UPLOAD_FOLDER = os.path.join(BACKEND_ROOT, 'uploads')

# Ensure the uploads directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@detection_routes.route('/detect-melanoma', methods=['POST'])
@cross_origin()
def detect_melanoma():
    """
    Endpoint to detect melanoma from an uploaded image.
    """
    # Check if model is loaded
    if MODEL is None:
        logger.error("ML Model not loaded")
        return jsonify({'error': 'ML Model is not available'}), 500

    # Check if a file is uploaded
    if 'file' not in request.files:
        logger.warning("No file uploaded")
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # Check if a file is selected
    if file.filename == '':
        logger.warning("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if the file has an allowed extension
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        try:
            # Save the uploaded file
            file.save(filepath)
            logger.info(f"File saved: {filepath}")
            
            # Predict using the ML model
            result = predict_melanoma(MODEL, filepath)
            logger.info(f"Prediction result: {result}")
            
            # Clean up the uploaded file
            os.remove(filepath)
            logger.info(f"Temporary file removed: {filepath}")
            
            # Return the prediction result
            return jsonify(result), 200
        
        except Exception as e:
            # Clean up the file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            
            logger.error(f"Prediction error: {e}")
            return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500
    
    # If the file type is invalid
    logger.warning(f"Invalid file type: {file.filename}")
    return jsonify({'error': 'Invalid file type'}), 400