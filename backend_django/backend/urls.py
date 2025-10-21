from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AppointmentDetailView,
    AppointmentView,
    DiagnosisHistoryView,
    LoginView,
    NearbyDoctorsView,
    PredictView,
    ProfileView,
    RegisterView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User
    path("profile/", ProfileView.as_view(), name="profile"),
    # Diagnosis
    path("predict/", PredictView.as_view(), name="predict"),
    path(
        "diagnosis/history/", DiagnosisHistoryView.as_view(), name="diagnosis_history"
    ),
    # Doctors
    path("doctors/nearby/", NearbyDoctorsView.as_view(), name="doctors_nearby"),
    # Appointments
    path("appointments/", AppointmentView.as_view(), name="appointments"),
    path(
        "appointments/<uuid:pk>/",
        AppointmentDetailView.as_view(),
        name="appointment_detail",
    ),
]
