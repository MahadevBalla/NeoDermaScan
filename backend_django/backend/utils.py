import os
from math import asin, cos, radians, sin, sqrt
from datetime import datetime

import requests
from django.conf import settings
from django.core.mail import send_mail
from supabase import create_client, Client

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "diagnosis-images")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_nearby_hospitals(lat, lon, radius=5000):
    """Fetch nearby hospitals using Google Places API"""
    if not GOOGLE_API_KEY:
        return []

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lon}",
        "radius": radius,
        "type": "hospital",
        "key": GOOGLE_API_KEY,
    }
    try:
        resp = requests.get(url, params=params, timeout=10).json()
        return resp.get("results", [])
    except Exception as e:
        print(f"Google Places API error: {e}")
        return []


def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    return 2 * R * asin(sqrt(a))


def upload_to_supabase(file, user_id):
    """
    Upload file to Supabase Storage
    Returns: (storage_path, public_url) or (None, None) if failed
    """
    if not supabase:
        print("Supabase client not initialized")
        return None, None

    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_name = file.name
        file_extension = original_name.split(".")[-1]
        unique_filename = f"{user_id}/{timestamp}_{original_name}"

        # Read file content
        file_content = file.read()

        # Upload to Supabase Storage
        response = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=unique_filename,
            file=file_content,
            file_options={"content-type": file.content_type},
        )

        # Get public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(
            unique_filename
        )

        return unique_filename, public_url

    except Exception as e:
        print(f"Supabase upload error: {e}")
        return None, None


def send_email_notification(subject, message, recipient):
    """
    Send email notification using Django's built-in email system
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[recipient],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False


def send_sms_notification(phone, message):
    """
    Send SMS notification using Twilio API
    """
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
        print("Twilio credentials not configured")
        return False

    try:
        from twilio.rest import Client

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message, from_=TWILIO_PHONE_NUMBER, to=str(phone)
        )
        print(f"SMS sent successfully: {message.sid}")
        return True
    except Exception as e:
        print(f"SMS sending failed: {e}")
        return False


def send_whatsapp_notification(phone, message):
    """
    Send WhatsApp notification using Twilio WhatsApp API
    """
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER = os.getenv(
        "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886"
    )  # Twilio sandbox

    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN]):
        print("Twilio credentials not configured")
        return False

    try:
        from twilio.rest import Client

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # Format phone number for WhatsApp
        formatted_phone = str(phone)
        if not formatted_phone.startswith("whatsapp:"):
            formatted_phone = f"whatsapp:{formatted_phone}"

        message = client.messages.create(
            body=message, from_=TWILIO_WHATSAPP_NUMBER, to=formatted_phone
        )
        print(f"WhatsApp sent successfully: {message.sid}")
        return True
    except Exception as e:
        print(f"WhatsApp sending failed: {e}")
        return False


def send_notification(
    user, subject, message, notification_type="appointment_confirmation"
):
    """
    Unified notification sender that respects user preferences
    Creates Notification record and sends via preferred channel
    """
    from .models import Notification

    # Check if user has given consent
    if not user.notification_consent:
        print(f"User {user.email} has not given notification consent")
        return False

    # Determine channel
    channel = user.notification_preference
    success = False
    error_message = None

    # Send notification based on preference
    try:
        if channel == "email":
            success = send_email_notification(subject, message, user.email)
        elif channel == "sms":
            success = send_sms_notification(user.phone_no, message)
        elif channel == "whatsapp":
            success = send_whatsapp_notification(user.phone_no, message)
        else:
            error_message = f"Unknown channel: {channel}"
    except Exception as e:
        error_message = str(e)

    # Create notification record
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        channel=channel,
        subject=subject,
        message=message,
        status="sent" if success else "failed",
        sent_at=datetime.now() if success else None,
        error_message=error_message,
    )

    return success
