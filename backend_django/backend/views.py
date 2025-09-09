import tempfile, os
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Diagnosis, Doctor, Appointment
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    # DiagnosisSerializer,
    # DoctorSerializer,
    # AppointmentSerializer,
)
from .ml.detection_model import load_model, predict_melanoma
from .utils import get_nearby_hospitals, haversine

User = get_user_model()
MODEL = load_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class ProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# class DiagnosisHistoryView(generics.ListAPIView):
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = DiagnosisSerializer

#     def get_queryset(self):
#         return Diagnosis.objects.filter(user=self.request.user)


class PredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        import tempfile, os

        tmp_dir = tempfile.mkdtemp()
        file_path = os.path.join(tmp_dir, file.name)
        with open(file_path, "wb+") as dest:
            for chunk in file.chunks():
                dest.write(chunk)

        result = predict_melanoma(MODEL, file_path)
        diagnosis = Diagnosis.objects.create(
            user=request.user,
            prediction=result["prediction"],
            confidence=result["confidence"],
            risk=result["risk"],
            recommendations="\n".join(result["recommendations"]),
        )

        return Response(
            {
                "prediction": diagnosis.prediction,
                "confidence": diagnosis.confidence,
                "risk": diagnosis.risk,
                "recommendations": diagnosis.recommendations,
            },
            status=201,
        )


# class NearbyDoctorsView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         user_lat = float(request.data.get("lat"))
#         user_lon = float(request.data.get("lon"))
#         max_distance = float(request.data.get("radius", 10))

#         doctors = []
#         for doc in Doctor.objects.all():
#             distance = haversine(user_lat, user_lon, doc.latitude, doc.longitude)
#             if distance <= max_distance:
#                 doctors.append((distance, doc))

#         doctors.sort(key=lambda x: x[0])
#         doctor_data = [
#             DoctorSerializer(doc).data | {"distance_km": round(dist, 2)}
#             for dist, doc in doctors
#         ]

#         if len(doctor_data) < 5:
#             hospitals = get_nearby_hospitals(
#                 user_lat, user_lon, radius=max_distance * 1000
#             )
#             for h in hospitals[: 5 - len(doctor_data)]:
#                 doctor_data.append(
#                     {
#                         "name": h["name"],
#                         "specialization": "General",
#                         "hospital": h["name"],
#                         "address": h.get("vicinity", ""),
#                         "latitude": h["geometry"]["location"]["lat"],
#                         "longitude": h["geometry"]["location"]["lng"],
#                     }
#                 )

#         return Response(doctor_data)


# class AppointmentView(generics.ListCreateAPIView):
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = AppointmentSerializer

#     def get_queryset(self):
#         return Appointment.objects.filter(user=self.request.user)

#     def perform_create(self, serializer):
#         serializer.save(user=self.request.user)
