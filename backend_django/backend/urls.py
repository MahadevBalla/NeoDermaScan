from django.urls import path
from .views import (
    ProfileView,
    # DiagnosisHistoryView,
    PredictView,
    # NearbyDoctorsView,
    # AppointmentView,
    RegisterView,
    LoginView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Other endpoints
    path("profile/", ProfileView.as_view()),
    path("predict/", PredictView.as_view()),
]
