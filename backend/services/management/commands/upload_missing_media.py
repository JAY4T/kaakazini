from django.core.management.base import BaseCommand
from django.conf import settings
from django.apps import apps
import boto3
import os

class Command(BaseCommand):
    help = "Upload all missing media files from DB to DigitalOcean Spaces"

    def handle(self, *args, **options):
        if not getattr(settings, "USE_SPACES", False):
            self.stdout.write(self.style.ERROR("USE_SPACES is False. Exiting."))
            return

        # Setup S3 client for DigitalOcean Spaces
        session = boto3.session.Session()
        s3 = session.client(
            "s3",
            region_name=settings.AWS_S3_REGION_NAME,
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        self.stdout.write(self.style.SUCCESS("Scanning all apps for ImageFields..."))

        # Loop through all installed apps
        for app_config in apps.get_app_configs():
            models = app_config.get_models()
            for model in models:
                for field in model._meta.fields:
                    if field.get_internal_type() in ['ImageField', 'FileField']:
                        self.stdout.write(f"Checking model {model.__name__}, field {field.name}...")
                        for obj in model.objects.all():
                            file_field = getattr(obj, field.name)
                            if file_field and hasattr(file_field, 'path'):
                                local_path = file_field.path
                                key = file_field.name
                                try:
                                    # Check if object exists in Spaces first
                                    s3.head_object(Bucket=bucket_name, Key=key)
                                except s3.exceptions.ClientError:
                                    # Upload if missing
                                    if os.path.exists(local_path):
                                        s3.upload_file(
                                            local_path,
                                            bucket_name,
                                            key,
                                            ExtraArgs={'ACL': 'public-read'}
                                        )
                                        self.stdout.write(self.style.SUCCESS(f"Uploaded: {key}"))
                                    else:
                                        self.stdout.write(self.style.WARNING(f"Local file missing: {local_path}"))

        self.stdout.write(self.style.SUCCESS("Media sync completed!"))
