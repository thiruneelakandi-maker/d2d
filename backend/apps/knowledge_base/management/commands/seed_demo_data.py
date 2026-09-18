import csv
import sys
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.knowledge_base.models import EmergencyKnowledge
from django.db import IntegrityError, transaction
from pathlib import Path


class Command(BaseCommand):
    help = 'Seed demo data from emergency_sample_dataset.csv into EmergencyKnowledge (apps.knowledge_base)'

    def add_arguments(self, parser):
        parser.add_argument('--file', '-f', help='Path to CSV file', default=None)

    def handle(self, *args, **options):
        file_path = options.get('file')
        if file_path:
            csv_path = Path(file_path)
        else:
            csv_path = Path(settings.BASE_DIR) / 'emergency_sample_dataset.csv'

        if not csv_path.exists():
            self.stderr.write(f"CSV file not found: {csv_path}")
            sys.exit(1)

        imported = 0
        skipped = 0
        errors = 0

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            required = ['emergency_type', 'priority', 'instruction']
            for row_num, row in enumerate(reader, start=1):
                try:
                    # Normalize keys
                    row = {k.strip(): (v.strip() if v is not None else '') for k, v in row.items()}
                    # Validate required
                    if not all(row.get(k) for k in required):
                        skipped += 1
                        continue

                    emergency_type = row.get('emergency_type')
                    try:
                        priority = int(row.get('priority') or 1)
                    except ValueError:
                        priority = 1
                    instruction = row.get('instruction')
                    recommended_service = row.get('recommended_service') or ''
                    verification = row.get('verification') or ''
                    verified_flag = str(verification).strip().lower() in ('verified', 'true', 'yes', '1')

                    # Prevent duplicates: use get_or_create based on emergency_type + instruction
                    with transaction.atomic():
                        obj, created = EmergencyKnowledge.objects.get_or_create(
                            emergency_type=emergency_type,
                            instruction=instruction,
                            defaults={
                                'priority': priority,
                                'recommended_service': recommended_service,
                                'verification': verification,
                                'trusted': verified_flag,
                            }
                        )
                        if created:
                            imported += 1
                        else:
                            # Update trusted flag if CSV marks verified and DB not trusted
                            if verified_flag and not obj.trusted:
                                obj.trusted = True
                                obj.verification = verification
                                obj.priority = priority
                                obj.recommended_service = recommended_service
                                obj.save()
                            skipped += 1
                except IntegrityError as e:
                    errors += 1
                    self.stderr.write(f"Row {row_num}: IntegrityError: {e}")
                except Exception as e:
                    errors += 1
                    self.stderr.write(f"Row {row_num}: Error: {e}")

        self.stdout.write(f"Imported: {imported}")
        self.stdout.write(f"Skipped: {skipped}")
        self.stdout.write(f"Errors: {errors}")
