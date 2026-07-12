from django.core.management.base import BaseCommand

from api.models import Bed


class Command(BaseCommand):
    help = "Releases beds whose 10-minute payment hold has expired, so they become bookable again."

    def handle(self, *args, **options):
        released = 0
        for bed in Bed.objects.filter(status=Bed.STATUS_PENDING):
            if bed.release_if_expired():
                released += 1
        self.stdout.write(self.style.SUCCESS(f"Released {released} expired bed hold(s)."))