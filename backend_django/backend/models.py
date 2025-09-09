import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_no = PhoneNumberField(_("phone number"), blank=False, null=False, unique=True)
    notification_preference = models.CharField(
        max_length=20,
        choices=[("email", "Email"), ("sms", "SMS"), ("whatsapp", "WhatsApp")],
        default="whatsapp",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone_no", "full_name"]

    def __str__(self):
        return self.email


class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name="diagnoses", on_delete=models.CASCADE)
    prediction = models.CharField(max_length=50)  # e.g. Benign / Melanoma
    confidence = models.FloatField()
    risk = models.CharField(max_length=20)
    recommendations = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.full_name} - {self.prediction} ({self.confidence:.2f})"


class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    hospital = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default="Mumbai")
    phone = PhoneNumberField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    working_hours = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.name} ({self.specialization})"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("booked", "Booked"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, related_name="appointments", on_delete=models.CASCADE
    )
    doctor = models.ForeignKey(
        Doctor, related_name="appointments", on_delete=models.CASCADE
    )
    date = models.DateField()
    time_slot = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="booked")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("doctor", "date", "time_slot")

    def __str__(self):
        return f"Appt: {self.user.full_name} with {self.doctor.name} on {self.date} at {self.time_slot}"
