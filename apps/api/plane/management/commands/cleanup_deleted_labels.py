"""
Management command to remove IssueLabel records that point to soft-deleted labels.

Usage:
    python manage.py cleanup_deleted_labels            # dry-run (only shows count)
    python manage.py cleanup_deleted_labels --execute  # performs the actual deletion

Run this after deleting labels and re-assigning cases to new ones so that
analytics shows only the active labels with accurate counts.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from plane.db.models import Label


class Command(BaseCommand):
    help = "Remove IssueLabel records pointing to soft-deleted labels"

    def add_arguments(self, parser):
        parser.add_argument(
            "--execute",
            action="store_true",
            default=False,
            help="Actually delete the orphaned records (default is dry-run).",
        )

    def handle(self, *args, **options):
        execute = options["execute"]

        # Find all soft-deleted labels (deleted_at is set)
        deleted_labels = Label.all_objects.filter(deleted_at__isnull=False)
        deleted_label_ids = list(deleted_labels.values_list("id", flat=True))

        if not deleted_label_ids:
            self.stdout.write(self.style.SUCCESS("No soft-deleted labels found. Nothing to clean up."))
            return

        self.stdout.write(f"Found {len(deleted_label_ids)} soft-deleted label(s).")

        # Import here to avoid circular imports
        from plane.db.models.issue import IssueLabel

        # Find IssueLabel records pointing to deleted labels (active or already soft-deleted)
        orphaned = IssueLabel.all_objects.filter(label_id__in=deleted_label_ids)
        count = orphaned.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No orphaned IssueLabel records found. Analytics is already clean."))
            return

        self.stdout.write(f"Found {count} orphaned IssueLabel record(s) pointing to deleted labels.")

        # Show breakdown by label name
        for label in deleted_labels:
            label_count = IssueLabel.all_objects.filter(label=label).count()
            if label_count:
                self.stdout.write(f"  - '{label.name}' (deleted {label.deleted_at:%Y-%m-%d}): {label_count} assignment(s)")

        if not execute:
            self.stdout.write(
                self.style.WARNING(
                    "\nDRY RUN — no changes made. Run with --execute to delete these records."
                )
            )
            return

        # Hard-delete the orphaned IssueLabel records
        deleted_count, _ = orphaned.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Removed {deleted_count} orphaned IssueLabel record(s). "
                "Analytics will now show only active labels with accurate counts."
            )
        )
