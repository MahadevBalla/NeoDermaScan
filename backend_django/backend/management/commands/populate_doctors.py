import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.models import Doctor, Address


class Command(BaseCommand):
    help = "Populate Doctor and Address data from JSON file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default=None,
            help="Path to the JSON file containing doctor data",
        )

    def handle(self, *args, **options):
        # If no file path is given, use the JSON file in the same folder as this script
        if options["file"]:
            file_path = options["file"]
        else:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_dir, "data.json")

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.stdout.write(self.style.SUCCESS(f"Loaded data from {file_path}"))

            doctors_created = 0
            addresses_created = 0

            with transaction.atomic():
                # Create/update doctors
                for doctor_data in data.get("doctors", []):
                    doctor, created = Doctor.objects.update_or_create(
                        id=doctor_data["id"],
                        defaults={
                            "name": doctor_data["name"],
                            "specialization": doctor_data["specialization"],
                            "hospital": doctor_data["hospital"],
                            "phone": doctor_data["phone"],
                            "email": doctor_data.get("email"),
                            "working_hours": doctor_data["working_hours"],
                            "license_number": doctor_data["license_number"],
                            "years_of_experience": doctor_data["years_of_experience"],
                            "qualifications": doctor_data.get("qualifications", ""),
                        },
                    )
                    if created:
                        doctors_created += 1

                # Create/update addresses
                for address_data in data.get("addresses", []):
                    try:
                        doctor = Doctor.objects.get(id=address_data["doctor_id"])
                        Address.objects.update_or_create(
                            id=address_data["id"],
                            defaults={
                                "doctor": doctor,
                                "user": None,
                                "address_line_1": address_data["address_line_1"],
                                "address_line_2": address_data.get("address_line_2"),
                                "city": address_data["city"],
                                "state": address_data["state"],
                                "country": address_data["country"],
                                "pincode": address_data["pincode"],
                                "landmark": address_data.get("landmark"),
                                "latitude": address_data.get("latitude"),
                                "longitude": address_data.get("longitude"),
                                "address_type": address_data["address_type"],
                                "is_primary": address_data["is_primary"],
                            },
                        )
                        addresses_created += 1
                    except Doctor.DoesNotExist:
                        self.stdout.write(
                            self.style.ERROR(
                                f'Doctor with ID {address_data["doctor_id"]} not found'
                            )
                        )

            self.stdout.write(
                self.style.SUCCESS(
                    f"\nSuccessfully populated:\n"
                    f"  - {doctors_created} doctors\n"
                    f"  - {addresses_created} addresses\n"
                    f"  - Total doctors in DB: {Doctor.objects.count()}\n"
                    f"  - Total addresses in DB: {Address.objects.count()}"
                )
            )

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR(f"Invalid JSON in file: {file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
