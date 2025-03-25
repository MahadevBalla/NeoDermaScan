# Step 1: Import Dependencies
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import timm
import albumentations as A
from albumentations.pytorch import ToTensorV2
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt
import os
from PIL import Image

# Enable CUDA if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# CUDA optimizations
torch.backends.cudnn.benchmark = True
torch.backends.cudnn.enabled = True

# Step 2: Read Metadata & Split Dataset
# Path to dataset
data_dir = "/media/paarth55/7ABA32E9BA32A195/dataset/SIIM-ISIC/"  # Change this
csv_path = os.path.join(data_dir, "train.csv")
image_dir = os.path.join(data_dir, "train")  # Folder with images

# Load CSV metadata
df = pd.read_csv(csv_path)
df["target"] = df["target"].astype(int)  # Convert labels to integers

# Print dataset summary
print(f"Total dataset size: {len(df)}")
print(df["target"].value_counts())  # Class distribution

# Stratified Train-Validation-Test Split (80-10-10)
train_df, temp_df = train_test_split(df, test_size=0.2, stratify=df["target"], random_state=42)
val_df, test_df = train_test_split(temp_df, test_size=0.5, stratify=temp_df["target"], random_state=42)

print(f"Training samples: {len(train_df)}, Validation samples: {len(val_df)}, Test samples: {len(test_df)}")

# Step 3: Define Image Transformations
train_transforms = A.Compose([
    A.Resize(224, 224),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.2),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2()
])

val_test_transforms = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2()
])

# Step 4: Define Custom Dataset Class
class MelanomaDataset(Dataset):
    def __init__(self, dataframe, img_dir, transform):
        self.dataframe = dataframe
        self.img_dir = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        row = self.dataframe.iloc[idx]
        img_path = os.path.join(self.img_dir, row["image_name"] + ".jpg")
        label = row["target"]

        # Load image
        image = Image.open(img_path).convert("RGB")
        image = np.array(image, dtype=np.uint8)  # Explicitly set dtype
        image = self.transform(image=image)["image"]

        return image, label

# Step 5: Load Data into DataLoaders
train_dataset = MelanomaDataset(train_df, image_dir, train_transforms)
val_dataset = MelanomaDataset(val_df, image_dir, val_test_transforms)
test_dataset = MelanomaDataset(test_df, image_dir, val_test_transforms)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=0, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False, num_workers=0, pin_memory=True)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False, num_workers=0, pin_memory=True)

print(f"Train loader: {len(train_loader)}, Validation loader: {len(val_loader)}, Test loader: {len(test_loader)}")

# Step 6: Define Model
class EfficientNetClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super(EfficientNetClassifier, self).__init__()
        self.model = timm.create_model('efficientnet_b0', pretrained=True)
        in_features = self.model.classifier.in_features
        self.model.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.model(x)

# Instantiate Model
model = EfficientNetClassifier(num_classes=2).to(device)

# Step 7: Define Training Components
# Class imbalance handling
class_counts = torch.tensor([32542, 584], dtype=torch.float)
weights = class_counts.sum() / class_counts
weights = weights.to(device)

# Print weights for debugging
print(f"Class weights: {weights}")

scaler = torch.amp.GradScaler()
criterion = nn.CrossEntropyLoss(weight=weights)
optimizer = optim.AdamW(model.parameters(), lr=1e-5, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)

# Step 8: Define Training and Validation Loops
def train_one_epoch(model, train_loader, optimizer, criterion, device, scaler, accumulation_steps=4):
    model.train()
    running_loss = 0.0
    optimizer.zero_grad()

    for batch_idx, (images, labels) in enumerate(train_loader):
        images, labels = images.to(device), labels.to(device)

        with torch.amp.autocast(device_type="cuda"):
            outputs = model(images)
            loss = criterion(outputs, labels) / accumulation_steps

        scaler.scale(loss).backward()

        if (batch_idx + 1) % accumulation_steps == 0:
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()

        running_loss += loss.item()

        # Debug prints
        if batch_idx % 10 == 0:
            print(f"Batch {batch_idx}/{len(train_loader)} - Loss: {loss.item():.4f}")

    return running_loss / len(train_loader)


def validate(model, val_loader, criterion, device):
    model.eval()
    val_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            val_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    val_accuracy = 100 * correct / total
    print(f"Validation - Loss: {val_loss:.4f}, Accuracy: {val_accuracy:.2f}%")
    return val_loss / len(val_loader), val_accuracy

# Step 9: Train the Model
num_epochs = 10
accumulation_steps = 4
best_acc = 0.0

for epoch in range(num_epochs):
    print(f"\nEpoch {epoch+1}/{num_epochs}")
    train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device, scaler, accumulation_steps)
    val_loss, val_accuracy = validate(model, val_loader, criterion, device)
    scheduler.step()

    print(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}, Val Acc: {val_accuracy:.2f}%")

    if val_accuracy > best_acc:
        best_acc = val_accuracy
        torch.save(model.state_dict(), "efficientnet_melanoma_best.pth")
        print("✅ Model Saved!")

# Step 10: Test Model
model.load_state_dict(torch.load("efficientnet_melanoma_best.pth"))

preds, true_labels = [], []
with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        preds.extend(predicted.cpu().numpy())
        true_labels.extend(labels.cpu().numpy())

# Generate Confusion Matrix
cm = confusion_matrix(true_labels, preds)
print("Confusion Matrix:\n", cm)

plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=["Benign", "Melanoma"], yticklabels=["Benign", "Melanoma"])
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()
