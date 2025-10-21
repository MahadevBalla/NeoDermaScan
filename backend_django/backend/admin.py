from django.contrib import admin
from .models import User, Address, Doctor, Diagnosis, Appointment, Notification


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "full_name",
        "phone_no",
        "notification_preference",
        "notification_consent",
        "date_joined",
    ]
    list_filter = ["notification_preference", "notification_consent", "date_joined"]
    search_fields = ["email", "full_name", "phone_no"]
    readonly_fields = ["id", "date_joined", "last_login"]

    fieldsets = (
        (
            "Basic Info",
            {"fields": ("id", "username", "email", "full_name", "phone_no")},
        ),
        (
            "Notifications",
            {"fields": ("notification_preference", "notification_consent")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Timestamps", {"fields": ("date_joined", "last_login")}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["get_owner", "city", "state", "address_type", "is_primary"]
    list_filter = ["city", "state", "address_type", "is_primary"]
    search_fields = ["address_line_1", "city", "state", "pincode"]
    readonly_fields = ["id"]

    def get_owner(self, obj):
        if obj.user:
            return f"User: {obj.user.full_name}"
        elif obj.doctor:
            return f"Doctor: {obj.doctor.name}"
        return "Unknown"

    get_owner.short_description = "Owner"


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "specialization",
        "hospital",
        "license_number",
        "years_of_experience",
        "phone",
        "email",
    ]
    list_filter = ["specialization", "years_of_experience"]
    search_fields = ["name", "hospital", "license_number", "email"]
    readonly_fields = ["id"]

    fieldsets = (
        ("Basic Info", {"fields": ("id", "name", "specialization", "hospital")}),
        (
            "Credentials",
            {"fields": ("license_number", "years_of_experience", "qualifications")},
        ),
        ("Contact", {"fields": ("phone", "email")}),
        ("Schedule", {"fields": ("working_hours",)}),
    )


@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "prediction",
        "confidence",
        "risk",
        "filename",
        "created_at",
    ]
    list_filter = ["prediction", "risk", "created_at"]
    search_fields = ["user__email", "user__full_name", "filename"]
    readonly_fields = ["id", "created_at"]

    fieldsets = (
        ("Patient Info", {"fields": ("id", "user")}),
        (
            "Diagnosis Results",
            {"fields": ("prediction", "confidence", "risk", "recommendations")},
        ),
        ("Image Info", {"fields": ("filename", "storage_path")}),
        ("Metadata", {"fields": ("created_at",)}),
    )


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["user", "doctor", "date", "time_slot", "status", "created_at"]
    list_filter = ["status", "date", "created_at"]
    search_fields = ["user__email", "user__full_name", "doctor__name"]
    readonly_fields = ["id", "created_at"]

    fieldsets = (
        (
            "Appointment Details",
            {"fields": ("id", "user", "doctor", "date", "time_slot", "status")},
        ),
        ("Metadata", {"fields": ("created_at",)}),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "notification_type",
        "channel",
        "status",
        "sent_at",
        "created_at",
    ]
    list_filter = ["notification_type", "channel", "status", "created_at"]
    search_fields = ["user__email", "subject", "message"]
    readonly_fields = ["id", "sent_at", "created_at"]

    fieldsets = (
        (
            "Notification Info",
            {"fields": ("id", "user", "notification_type", "channel")},
        ),
        ("Content", {"fields": ("subject", "message")}),
        ("Status", {"fields": ("status", "sent_at", "error_message")}),
        ("Metadata", {"fields": ("created_at",)}),
    )
