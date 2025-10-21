from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Address, Appointment, Diagnosis, Doctor, Notification

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "full_name",
            "phone_no",
            "notification_preference",
            "notification_consent",
            "password",
            "confirm_password",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        return User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            phone_no=validated_data["phone_no"],
            notification_preference=validated_data.get(
                "notification_preference", "email"
            ),
            notification_consent=validated_data.get("notification_consent", True),
            password=validated_data["password"],
        )


class LoginSerializer(TokenObtainPairSerializer):
    """JWT login response with user info"""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": str(self.user.id),
            "email": self.user.email,
            "full_name": getattr(self.user, "full_name", ""),
            "phone_no": str(self.user.phone_no),
            "notification_preference": self.user.notification_preference,
            "notification_consent": self.user.notification_consent,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_no",
            "notification_preference",
            "notification_consent",
        ]
        read_only_fields = ["id", "email"]


class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.ReadOnlyField(source="get_full_address")

    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["id"]


class DoctorSerializer(serializers.ModelSerializer):
    primary_address = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = "__all__"

    def get_primary_address(self, obj):
        addr = obj.primary_address
        return AddressSerializer(addr).data if addr else None


class DiagnosisSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Diagnosis
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "user",
            "doctor",
            "doctor_id",
            "date",
            "time_slot",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at", "status"]

    def create(self, validated_data):
        doctor_id = validated_data.pop("doctor_id")
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError({"doctor_id": "Doctor not found"})

        return Appointment.objects.create(doctor=doctor, **validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["id", "sent_at", "created_at"]
