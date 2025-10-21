import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField


class CustomUserManager(BaseUserManager):
    def create_user(self, email, phone_no, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, phone_no=phone_no, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_no, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, phone_no, password, **extra_fields)


class User(AbstractUser):
    username = None
    objects = CustomUserManager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_no = PhoneNumberField(_("phone number"), blank=False, null=False, unique=True)
    notification_preference = models.CharField(
        max_length=20,
        choices=[("email", "Email"), ("sms", "SMS"), ("whatsapp", "WhatsApp")],
        default="email",
    )
    notification_consent = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone_no", "full_name"]

    def __str__(self):
        return self.email


class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, related_name="addresses", on_delete=models.CASCADE, null=True, blank=True
    )
    doctor = models.ForeignKey(
        "Doctor",
        related_name="addresses",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default="India")
    pincode = models.CharField(max_length=20)
    landmark = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address_type = models.CharField(
        max_length=20,
        choices=[
            ("home", "Home"),
            ("work", "Work"),
            ("clinic", "Clinic"),
            ("other", "Other"),
        ],
        default="home",
    )
    is_primary = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        owner = (
            self.user.full_name
            if self.user
            else (self.doctor.name if self.doctor else "Unknown")
        )
        return f"{owner} - {self.city}"

    def get_full_address(self):
        parts = [
            self.address_line_1,
            self.address_line_2,
            self.landmark,
            self.city,
            self.state,
            self.country,
            self.pincode,
        ]
        return ", ".join(filter(None, parts))


class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100, default="Dermatology")
    hospital = models.CharField(max_length=150)
    phone = PhoneNumberField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    working_hours = models.JSONField(default=dict, blank=True)
    license_number = models.CharField(max_length=50, unique=True, default="")
    years_of_experience = models.IntegerField(default=0)
    qualifications = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"

    @property
    def primary_address(self):
        return self.addresses.filter(is_primary=True).first()


class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name="diagnoses", on_delete=models.CASCADE)
    prediction = models.CharField(max_length=50)  # e.g. Benign / Melanoma
    confidence = models.FloatField()
    risk = models.CharField(max_length=20)
    recommendations = models.TextField()
    filename = models.CharField(max_length=255, default="unknown_file.txt")
    storage_path = models.CharField(max_length=500, default="unknown_path")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Diagnoses"

    def __str__(self):
        return f"{self.user.full_name} - {self.prediction} ({self.confidence:.2f}%)"


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
        ordering = ["-created_at"]

    def __str__(self):
        return f"Appt: {self.user.full_name} with Dr. {self.doctor.name} on {self.date} at {self.time_slot}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ("appointment_confirmation", "Appointment Confirmation"),
        ("appointment_cancellation", "Appointment Cancellation"),
        ("appointment_reminder", "Appointment Reminder"),
        ("diagnosis_complete", "Diagnosis Complete"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, related_name="notifications", on_delete=models.CASCADE
    )
    notification_type = models.CharField(
        max_length=50, choices=NOTIFICATION_TYPE_CHOICES
    )
    channel = models.CharField(
        max_length=20,
        choices=[("email", "Email"), ("sms", "SMS"), ("whatsapp", "WhatsApp")],
    )
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.notification_type} - {self.user.email} via {self.channel} ({self.status})"
