from django.core.management.base import BaseCommand
from apps.emergency_contacts.models import EmergencyContact


class Command(BaseCommand):
    help = 'Seed demo emergency contacts (clearly marked as DEMO DATA)'

    def handle(self, *args, **options):
        # Create a few demo contacts. These are NOT real emergency numbers.
        demo_contacts = [
            {
                'name': 'Demo Police Dispatch (DEMO DATA)',
                'service_type': 'police',
                'phone': '',
                'region': 'GLOBAL',
                'is_primary': True,
                'description': 'DEMO DATA - not a real emergency number',
                'verified': True,
                'is_demo': True,
            },
            {
                'name': 'Demo Ambulance Service (DEMO DATA)',
                'service_type': 'ambulance',
                'phone': '',
                'region': 'GLOBAL',
                'is_primary': True,
                'description': 'DEMO DATA - not a real emergency number',
                'verified': True,
                'is_demo': True,
            },
            {
                'name': 'Demo Fire & Rescue (DEMO DATA)',
                'service_type': 'fire',
                'phone': '',
                'region': 'GLOBAL',
                'is_primary': True,
                'description': 'DEMO DATA - not a real emergency number',
                'verified': True,
                'is_demo': True,
            },
        ]

        for c in demo_contacts:
            obj, created = EmergencyContact.objects.get_or_create(
                name=c['name'],
                defaults=c
            )
            if created:
                self.stdout.write(f"Created demo contact: {obj.name}")
            else:
                self.stdout.write(f"Demo contact already exists: {obj.name}")

        self.stdout.write('Seeding demo contacts complete.')
