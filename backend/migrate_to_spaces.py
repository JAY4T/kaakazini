import os
import boto3
from botocore.exceptions import ClientError
from decouple import config
import mimetypes
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# Load DigitalOcean Spaces settings
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME", default="fra1")
AWS_S3_ENDPOINT_URL = config("AWS_S3_ENDPOINT_URL")

# Local media folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

if not os.path.exists(MEDIA_ROOT):
    logging.error(f"MEDIA_ROOT folder does not exist: {MEDIA_ROOT}")
    exit(1)

# Connect to DigitalOcean Spaces
session = boto3.session.Session()
s3_client = session.client(
    "s3",
    region_name=AWS_S3_REGION_NAME,
    endpoint_url=AWS_S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

# Walk through all files in media folder
for root, dirs, files in os.walk(MEDIA_ROOT):
    for filename in files:
        local_path = os.path.join(root, filename)
        relative_path = os.path.relpath(local_path, MEDIA_ROOT)
        s3_path = relative_path.replace("\\", "/")  # Windows compatibility

        try:
            s3_client.head_object(Bucket=AWS_STORAGE_BUCKET_NAME, Key=s3_path)
            logging.info(f"Skipping {s3_path} (already exists)")
        except ClientError as e:
            if e.response['Error']['Code'] == "404":
                # Determine content type
                content_type, _ = mimetypes.guess_type(local_path)
                extra_args = {"ACL": "public-read"}
                if content_type:
                    extra_args["ContentType"] = content_type

                try:
                    s3_client.upload_file(
                        local_path,
                        AWS_STORAGE_BUCKET_NAME,
                        s3_path,
                        ExtraArgs=extra_args
                    )
                    logging.info(f"Uploaded {s3_path} successfully")
                except ClientError as upload_error:
                    logging.error(f"Failed to upload {s3_path}: {upload_error}")
            else:
                logging.error(f"Error checking {s3_path}: {e}")
