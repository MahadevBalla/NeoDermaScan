import os
from django.db import models
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
            message=f"Hello {request.user.full_name or ''}, your skin lesion analysis is complete.\n"
            f"Prediction: {result['prediction']}\n"
            f"Confidence: {result['confidence']}%\n"
            f"Risk Level: {result['risk']}\n\n"
            f"Recommendations:\n- " + "\n- ".join(result["recommendations"]) + "\n\n"
            "Please consult a dermatologist for further evaluation if needed.",
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
        try:
            user_lat = float(request.data.get("lat"))
            user_lon = float(request.data.get("lon"))
            max_distance = float(request.data.get("radius", 10))
            specialization = request.data.get("specialization", None)
            city = request.data.get("city", None)
            search = request.data.get("search", None)

            # Start with all doctors
            doctors_qs = Doctor.objects.all()

            # Apply filters if provided
            if specialization:
                doctors_qs = doctors_qs.filter(specialization__icontains=specialization)
            if city:
                # Filter by city in address
                doctors_qs = doctors_qs.filter(
                    addresses__city__icontains=city
                ).distinct()
            if search:
                doctors_qs = doctors_qs.filter(
                    models.Q(name__icontains=search)
                    | models.Q(hospital__icontains=search)
                    | models.Q(specialization__icontains=search)
                ).distinct()

            doctors = []
            for doc in doctors_qs:
                # Get doctor's primary address for location
                primary_addr = doc.primary_address
                if (
                    not primary_addr
                    or not primary_addr.latitude
                    or not primary_addr.longitude
                ):
                    # Skip doctors without valid location data
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

            # If no doctors found within the radius, return all doctors with distance info
            if not doctor_data_list:
                for doc in doctors_qs:
                    primary_addr = doc.primary_address
                    if (
                        not primary_addr
                        or not primary_addr.latitude
                        or not primary_addr.longitude
                    ):
                        continue

                    distance = haversine(
                        user_lat,
                        user_lon,
                        primary_addr.latitude,
                        primary_addr.longitude,
                    )
                    doctor_data = DoctorSerializer(doc).data
                    doctor_data["distance_km"] = round(distance, 2)

                    if primary_addr:
                        doctor_data["address"] = AddressSerializer(primary_addr).data

                    doctors.append((distance, doctor_data))

                # Sort by distance
                doctors.sort(key=lambda x: x[0])
                doctor_data_list = [doc_data for _, doc_data in doctors]

            return Response(doctor_data_list)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AppointmentView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        # Check if doctor_id and date query parameters are provided
        doctor_id = self.request.query_params.get("doctor_id")
        date = self.request.query_params.get("date")

        if doctor_id and date:
            # Return all appointments for the specified doctor and date
            return Appointment.objects.filter(doctor_id=doctor_id, date=date)
        else:
            # Return only the current user's appointments
            return Appointment.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            # Get doctor_id from request data
            doctor_id = request.data.get("doctor_id")
            if not doctor_id:
                return Response(
                    {"error": "Doctor ID is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get date and time_slot from request data
            date = request.data.get("date")
            time_slot = request.data.get("time_slot")

            if not date or not time_slot:
                return Response(
                    {"error": "Date and time are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if doctor exists
            try:
                doctor = Doctor.objects.get(id=doctor_id)
            except Doctor.DoesNotExist:
                return Response(
                    {"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Check if the time slot is available
            if Appointment.objects.filter(
                doctor=doctor, date=date, time_slot=time_slot, status="booked"
            ).exists():
                return Response(
                    {"error": "This time slot is already booked"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create appointment
            appointment = Appointment.objects.create(
                user=request.user,
                doctor=doctor,
                date=date,
                time_slot=time_slot,
                status="booked",
            )

            # Send appointment confirmation notification
            send_notification(
                user=appointment.user,
                subject="Appointment Confirmation",
                message=f"Hello {appointment.user.full_name or ''}, your appointment has been confirmed!\n"
                f"Doctor: Dr. {appointment.doctor.name} ({appointment.doctor.specialization})\n"
                f"Hospital: {appointment.doctor.hospital}\n"
                f"Date: {appointment.date}\n"
                f"Time: {appointment.time_slot}\n\n"
                "Please arrive 10-15 minutes early and carry any previous medical reports.",
                notification_type="appointment_confirmation",
            )

            serializer = self.get_serializer(appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
                    message=f"Hello {instance.user.full_name or ''},\n\n"
                    f"Your appointment with Dr. {instance.doctor.name}({instance.doctor.specialization}) at {instance.doctor.hospital} on {instance.date} at {instance.time_slot} has been cancelled.\n\n"
                    "You can book a new appointment at your convenience."
                    "Thank you for keeping us informed!",
                    notification_type="appointment_cancellation",
                )

            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=200)

        return super().patch(request, *args, **kwargs)
