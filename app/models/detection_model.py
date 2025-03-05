import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import os
import timm  # Add timm library for EfficientNet

class EfficientNetClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super(EfficientNetClassifier, self).__init__()
        self.model = timm.create_model('efficientnet_b0', pretrained=False)  # No pretrained weights
        in_features = self.model.classifier.in_features
        self.model.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.model(x)

def load_model(model_path=None):
    if model_path is None:
        # Construct the absolute path to the model file
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Points to 'backend'
        model_path = os.path.join(base_dir, 'ml-model', 'model1.pth')
    
    print(f"Base directory: {base_dir}")
    print(f"Model path: {model_path}")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    
    # Instantiate the EfficientNet model
    model = EfficientNetClassifier(num_classes=2)
    
    # Load the state dictionary
    state_dict = torch.load(model_path, map_location=torch.device('cpu'))
    model.load_state_dict(state_dict)
    
    # Set the model to evaluation mode
    model.eval()
    
    return model

def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    image = Image.open(image_path).convert('RGB')
    return transform(image).unsqueeze(0)

def predict_melanoma(model, image_path):
    with torch.no_grad():
        input_tensor = preprocess_image(image_path)
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        class_idx = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][class_idx].item()
        
        classes = ['Benign', 'Melanoma']
        prediction = classes[class_idx]
        
        return {
            'prediction': prediction,
            'confidence': round(confidence * 100, 2),
            'risk': 'High' if prediction == 'Melanoma' else 'Low',
            'recommendations': [
                "Schedule an appointment with a dermatologist as soon as possible" if prediction == 'Melanoma' 
                else "Continue monitoring the skin area",
                "Avoid excessive sun exposure",
                "Take clear photos to track any changes"
            ],
            'similarCases': 156,  # Placeholder value
            'differentialDiagnosis': [
                {
                    'condition': prediction,
                    'probability': round(confidence * 100, 2)
                },
                {
                    'condition': 'Melanoma' if prediction == 'Benign' else 'Benign',
                    'probability': round((1 - confidence) * 100, 2)
                }
            ]
        }

# Example usage
if __name__ == '__main__':
    model = load_model()
    result = predict_melanoma(model, 'ISIC_0076742.jpg')
    print(result)