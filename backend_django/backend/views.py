import os
import tempfile

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .ml.detection_model import load_model, predict_melanoma
from .models import Address, Appointment, Diagnosis, Doctor
from .serializers import (
    AddressSerializer,
    AppointmentSerializer,
    DiagnosisSerializer,
    DoctorSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .utils import (
    get_nearby_hospitals,
    haversine,
    send_notification,
    upload_to_supabase,
)

User = get_user_model()
MODEL = load_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class PredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        # Validate file type
        allowed_extensions = ["jpg", "jpeg", "png"]
        file_extension = file.name.split(".")[-1].lower()
        if file_extension not in allowed_extensions:
            return Response(
                {
                    "error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
                },
                status=400,
            )

        # Upload to Supabase Storage
        storage_path, public_url = upload_to_supabase(file, request.user.id)

        if not storage_path:
            return Response({"error": "Failed to upload image to storage"}, status=500)

        # Save to temp file for ML prediction
        tmp_dir = tempfile.mkdtemp()
        file_path = os.path.join(tmp_dir, file.name)

        # Reset file pointer before reading again
        file.seek(0)

        with open(file_path, "wb+") as dest:
            for chunk in file.chunks():
                dest.write(chunk)

        # Run ML prediction
        result = predict_melanoma(MODEL, file_path)

        # Create diagnosis record
        diagnosis = Diagnosis.objects.create(
            user=request.user,
            prediction=result["prediction"],
            confidence=result["confidence"],
            risk=result["risk"],
            recommendations="\n".join(result["recommendations"]),
            filename=file.name,
            storage_path=public_url or storage_path,
        )

        # Clean up temp file
        try:
            os.remove(file_path)
            os.rmdir(tmp_dir)
        except Exception:
            pass

        # Send notification about diagnosis completion
        send_notification(
            user=request.user,
            subject="Diagnosis Complete",
            message=f"Your skin lesion analysis is complete. Result: {result['prediction']} with {result['confidence']}% confidence. Risk Level: {result['risk']}.",
            notification_type="diagnosis_complete",
        )

        return Response(DiagnosisSerializer(diagnosis).data, status=201)


class DiagnosisHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DiagnosisSerializer

    def get_queryset(self):
        return Diagnosis.objects.filter(user=self.request.user).order_by("-created_at")


class NearbyDoctorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_lat = float(request.data.get("lat"))
        user_lon = float(request.data.get("lon"))
        max_distance = float(request.data.get("radius", 10))

        # Filter parameters
        specialization = request.data.get("specialization", None)
        city = request.data.get("city", None)

        # Start with all doctors
        doctors_qs = Doctor.objects.all()

        # Apply filters if provided
        if specialization:
            doctors_qs = doctors_qs.filter(specialization__icontains=specialization)
        if city:
            # Filter by city in address
            doctors_qs = doctors_qs.filter(addresses__city__icontains=city).distinct()

        doctors = []
        for doc in doctors_qs:
            # Get doctor's primary address for location
            primary_addr = doc.primary_address
            if (
                not primary_addr
                or not primary_addr.latitude
                or not primary_addr.longitude
            ):
                continue

            distance = haversine(
                user_lat, user_lon, primary_addr.latitude, primary_addr.longitude
            )
            if distance <= max_distance:
                doctor_data = DoctorSerializer(doc).data
                doctor_data["distance_km"] = round(distance, 2)

                # Include primary address details
                if primary_addr:
                    doctor_data["address"] = AddressSerializer(primary_addr).data

                doctors.append((distance, doctor_data))

        # Sort by distance
        doctors.sort(key=lambda x: x[0])
        doctor_data_list = [doc_data for _, doc_data in doctors]

        # If less than 5 doctors, supplement with Google Places
        if len(doctor_data_list) < 5:
            hospitals = get_nearby_hospitals(
                user_lat, user_lon, radius=int(max_distance * 1000)
            )
            for h in hospitals[: 5 - len(doctor_data_list)]:
                doctor_data_list.append(
                    {
                        "id": None,
                        "name": h["name"],
                        "specialization": "General",
                        "hospital": h["name"],
                        "address": {
                            "address_line_1": h.get("vicinity", ""),
                            "city": "",
                            "state": "",
                            "country": "India",
                            "latitude": h["geometry"]["location"]["lat"],
                            "longitude": h["geometry"]["location"]["lng"],
                        },
                        "phone": None,
                        "email": None,
                        "distance_km": None,
                    }
                )

        return Response(doctor_data_list)


class AppointmentView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        appointment = serializer.save(user=self.request.user)

        # Send appointment confirmation notification
        send_notification(
            user=appointment.user,
            subject="Appointment Confirmation",
            message=f"Your appointment with Dr. {appointment.doctor.name} at {appointment.doctor.hospital} on {appointment.date} at {appointment.time_slot} is confirmed.",
            notification_type="appointment_confirmation",
        )


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()

    def get_queryset(self):
        # Users can only access their own appointments
        return Appointment.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        status_update = request.data.get("status")

        if status_update in ["cancelled", "completed"]:
            instance.status = status_update
            instance.save()

            # Send notification if cancelled
            if status_update == "cancelled":
                send_notification(
                    user=instance.user,
                    subject="Appointment Cancelled",
                    message=f"Your appointment with Dr. {instance.doctor.name} at {instance.doctor.hospital} on {instance.date} at {instance.time_slot} has been cancelled.",
                    notification_type="appointment_cancellation",
                )

            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=200)

        return super().patch(request, *args, **kwargs)
