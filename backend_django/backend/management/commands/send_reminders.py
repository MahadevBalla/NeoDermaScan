# Management command to send appointment reminders
# Run this via cron job on EC2: 0 9 * * * cd /path/to/project && python manage.py send_reminders

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from backend.models import Appointment
from backend.utils import send_notification


class Command(BaseCommand):
    help = "Send appointment reminders for appointments scheduled tomorrow"

    def handle(self, *args, **options):
        tomorrow = timezone.now().date() + timedelta(days=1)
        appointments = Appointment.objects.filter(date=tomorrow, status="booked")

        if not appointments.exists():
            self.stdout.write("No appointments found for tomorrow.")
            return

        sent_count = 0
        failed_count = 0

        for appointment in appointments:
            message = (
                f"Reminder: You have an appointment with Dr. {appointment.doctor.name} "
                f"at {appointment.doctor.hospital} tomorrow ({appointment.date}) "
                f"at {appointment.time_slot}. Please arrive 10 minutes early."
            )

            success = send_notification(
                user=appointment.user,
                subject="Appointment Reminder",
                message=message,
                notification_type="appointment_reminder",
            )

            if success:
                sent_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Reminder sent to {appointment.user.email}")
                )
            else:
                failed_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to send reminder to {appointment.user.email}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"\nSummary: {sent_count} sent, {failed_count} failed")
        )
