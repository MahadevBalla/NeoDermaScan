from app import create_app
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = create_app()

if __name__ == '__main__':
    app.run(
        debug=True, 
        host='0.0.0.0', 
        port=5000
    )