import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import timm
import os


class EfficientNetClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.model = timm.create_model("efficientnet_b0", pretrained=False)
        in_features = self.model.classifier.in_features
        self.model.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.model(x)


def load_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model.pth")
    model = EfficientNetClassifier(num_classes=2)
    state_dict = torch.load(model_path, map_location=torch.device("cpu"))
    model.load_state_dict(state_dict)
    model.eval()
    return model


def preprocess_image(image_path):
    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )
    image = Image.open(image_path).convert("RGB")
    return transform(image).unsqueeze(0)


def predict_melanoma(model, image_path):
    with torch.no_grad():
        input_tensor = preprocess_image(image_path)
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        class_idx = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][class_idx].item()

        classes = ["Benign", "Melanoma"]
        prediction = classes[class_idx]

        return {
            "prediction": prediction,
            "confidence": round(confidence * 100, 2),
            "risk": "High" if prediction == "Melanoma" else "Low",
            "recommendations": [
                (
                    "Schedule dermatologist visit ASAP"
                    if prediction == "Melanoma"
                    else "Monitor the skin area"
                ),
                "Avoid excessive sun exposure",
                "Take clear photos to track changes",
            ],
        }
