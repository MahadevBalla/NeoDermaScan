from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "full_name",
            "email",
            "phone_no",
            "notification_preference",
            "password",
            "confirm_password",
        )

    def validate(self, attrs):
        import logging

        logger = logging.getLogger(__name__)
        logger.info(f"Incoming signup data: {attrs}")
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        return User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            phone_no=validated_data["phone_no"],
            notification_preference=validated_data.get(
                "notification_preference", "whatsapp"
            ),
            password=validated_data["password"],
        )


class LoginSerializer(TokenObtainPairSerializer):
    """Extends default JWT login to include user info in response"""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "full_name": getattr(self.user, "full_name", self.user.username),
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "phone_no",
            "notification_preference",
        ]
