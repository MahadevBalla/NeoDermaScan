# NeoDermaScan: AI-Powered Melanoma Detection Platform

## Overview

NeoDermaScan is a web-based platform for early detection of melanoma skin cancer using deep learning. The system uses an EfficientNet-based CNN trained on the SIIM-ISIC dataset to analyze skin lesion images and provide risk assessments. It includes patient management, appointment booking, dermatologist discovery, and multi-channel notifications.

---

## Features

- **AI-Powered Diagnosis** - Upload skin lesion images for melanoma risk assessment with confidence scores and recommendations
- **Diagnosis History** - Track all previous scans with timestamps and results
- **Dermatologist Discovery** - Find nearby dermatologists using location-based search with filtering by specialization and city
- **Appointment Management** - Schedule, view, and cancel appointments with automatic notifications
- **Multi-Channel Notifications** - Email, SMS, and WhatsApp support based on user preference
- **Appointment Reminders** - Automated reminders sent 24 hours before scheduled appointments
- **Admin Panel** - Django admin interface for managing users, doctors, appointments, and notifications

---

## Tech Stack

**Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Axios

**Backend**: Django 5.2.5, Django REST Framework, PostgreSQL, Supabase, JWT Authentication, Twilio

**Machine Learning**: PyTorch, EfficientNet-B0, Distributed Data Parallel (DDP), Albumentations

---

## Project Structure

```
NeoDermaScan/
├── backend_django/
│   ├── config/                     # Django project settings & URLs
│   ├── backend/                    # Main Django app
│   │   ├── management/commands/    # Appointment reminder scheduler
│   │   ├── ml/                     # ML model & inference
│   │   ├── models.py               # Database models
│   │   ├── serializers.py          # DRF serializers
│   │   ├── urls.py                 # API routes
│   │   ├── utils.py                # Notifications, storage, helpers
│   │   └── views.py                # API endpoints
│   ├── .env                        # Environment variables
│   ├── manage.py                   # Django entry point
│   └── requirements.txt            # Python dependencies
│
├── frontend/vite-project/
│   ├── public/                     # Public assets
│   ├── src/
│   │   ├── assets/                 # Assets
│   │   ├── components/             # Reusable components
│   │   ├── pgs/                    # Page components
│   │   ├── slices/                 # Redux slices                 
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── store.js
│   ├── .env                        # Environment variables
│   └── package.json
│
└── ml-model/
    ├── script.py                   # Training script
    ├── model.pth                   # Trained weights
    └── confusion-matrix.png
```

---

## ML Model, Results & Performance

- **Model Architecture:** EfficientNet-B0 pre-trained on ImageNet
- **Preprocessing:**
  - Resized images to `224x224`
  - Applied data augmentations: Horizontal/Vertical Flip, Brightness Contrast
  - Normalized images (mean & std of ImageNet dataset)
- **Best Validation Accuracy:** `82.37%`
- **Loss Reduction Trend:** Model showed smooth convergence with AdamW optimizer.
- **Balanced Predictions:** Despite an imbalanced dataset, weighted cross-entropy loss helped improve recall.

![Confusion Matrix](ml-model/confusion-matrix.png)

---

## Setup and Installation

### Prerequisites

- Python 3.10+, Node.js 18+, PostgreSQL or Supabase account

### Clone the repository

```bash
git clone https://github.com/MahadevBalla/NeoDermaScan
cd NeoDermaScan
```

### Backend Setup

```bash
cd backend_django
python3 -m venv venv # Windows: python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure .env file (see .env.example)

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # Runs at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend/vite-project
npm install
npm run dev  # Runs at http://localhost:5173
```

---

## Usage

**For Patients**:

1. Register with email, phone, and notification preferences
2. Upload skin lesion images for AI analysis
3. View diagnosis results with risk assessment
4. Find nearby dermatologists using location filters
5. Book appointments and receive notifications
6. Track diagnosis history and manage appointments

**For Administrators**:

- Access admin panel at `http://localhost:8000/admin`
- Manage users, doctors, appointments, and notifications
- Monitor system-wide analytics

---

## Future Enhancements

- Grad-CAM visualization for explainable AI
- Multi-class classification for other skin conditions
- Telemedicine integration with video consultation
- Progressive Web App (PWA) for offline functionality
- Native mobile applications
- Multilingual support

---

## Contributors

**Team Members**: Mahadev Balla, Paarth Mahadik, Daksh Bari

---

## References

**Research Papers**:

- [Esteva, A., et al. (2017). "Dermatologist-level classification of skin cancer with deep neural networks." *Nature*.](https://www.nature.com/articles/nature21056)
- [Tan, M., & Le, Q. (2019). "EfficientNet: Rethinking Model Scaling for CNNs." *ICML*.](https://arxiv.org/abs/1905.11946)

**Datasets**:

- [SIIM-ISIC Melanoma Classification](https://www.kaggle.com/competitions/siim-isic-melanoma-classification/data)

**Documentation**:

- [PyTorch](https://pytorch.org/docs/) | [Django](https://docs.djangoproject.com/) | [React](https://react.dev/)
- [Supabase](https://supabase.com/docs) | [Twilio](https://www.twilio.com/docs)

---

**Last Updated**: October 2025
