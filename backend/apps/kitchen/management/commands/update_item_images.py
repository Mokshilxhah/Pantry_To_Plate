"""
Django management command to update master_items with image URLs
Usage: python manage.py update_item_images --results image_results.json
"""

from django.core.management.base import BaseCommand
from apps.pantry.models import MasterItem
import json


class Command(BaseCommand):
    help = 'Update master_items with image URLs from image_results.json'

    def add_arguments(self, parser):
        parser.add_argument(
            '--results',
            type=str,
            default='image_results.json',
            help='Path to image_results.json file'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes'
        )

    def handle(self, *args, **options):
        results_file = options['results']
        dry_run = options['dry_run']

        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS('Update Master Items with Images'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))

        # Load results
        try:
            with open(results_file, 'r', encoding='utf-8') as f:
                results = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Error: {results_file} not found'))
            return

        updated_count = 0
        not_found_count = 0
        skipped_count = 0

        for result in results:
            slug = result['slug']
            image_url = result.get('image_url')

            if not image_url:
                skipped_count += 1
                continue

            try:
                # Try to find by slug first, then by name
                item = MasterItem.objects(slug=slug).first()
                
                if not item:
                    # Try finding by name (convert slug to name)
                    name = slug.replace('-', ' ').title()
                    item = MasterItem.objects(name=name).first()
                
                if item:
                    if dry_run:
                        self.stdout.write(
                            f'Would update: {item.name} -> {image_url}'
                        )
                    else:
                        item.image_url = image_url
                        item.save()
                        self.stdout.write(
                            self.style.SUCCESS(f'✓ Updated: {item.name}')
                        )
                    
                    updated_count += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f'✗ Not found in DB: {slug}')
                    )
                    not_found_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error updating {slug}: {e}')
                )
                not_found_count += 1

        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS('Summary'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}'))
        self.stdout.write(f'✓ Updated: {updated_count}')
        self.stdout.write(f'✗ Not found: {not_found_count}')
        self.stdout.write(f'⊘ Skipped (no image): {skipped_count}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n(Dry run - no changes made)'))
