import json
import io
from minio import Minio
from src.config.env import env

minio_cfg = env['minio']

# Initialize the MinIO client
# Python's Minio client combines endpoint and port into a single string
minio_client = Minio(
    endpoint=f"{minio_cfg['endpoint']}:{minio_cfg['port']}",
    access_key=minio_cfg['access_key'],
    secret_key=minio_cfg['secret_key'],
    secure=minio_cfg['use_ssl']
)

def init_bucket():
    """
    Initialize storage bucket and set policy to public-read for asset retrieval
    """
    bucket_name = minio_cfg['bucket']
    try:
        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)
            print(f"Bucket '{bucket_name}' created successfully.")
            
            # Define read-only public access policy for the bucket
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicRead",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                    }
                ]
            }
            
            # Set the policy (json.dumps converts the dictionary to a JSON string)
            minio_client.set_bucket_policy(bucket_name, json.dumps(policy))
            print(f"Bucket policy set to public-read for '{bucket_name}'.")
        else:
            print(f"Bucket '{bucket_name}' already exists.")
            
    except Exception as err:
        print(f"❌ Failed to initialize MinIO bucket: {str(err)}")
        # Allow server startup even if MinIO is temporarily unavailable


def upload_file(object_name, file_data, mimetype):
    """
    Upload a file to MinIO bucket
    :param object_name: Destination path in bucket
    :param file_data: File raw bytes (buffer) or Flask FileStorage object
    :param mimetype: Content-Type header
    :returns: Public URL of the uploaded object
    """
    bucket_name = minio_cfg['bucket']
    try:
        # If the data comes in as raw bytes (equivalent to Node's Buffer), wrap it
        if isinstance(file_data, bytes):
            data_stream = io.BytesIO(file_data)
            data_length = len(file_data)
        else:
            # If it's already a file object (e.g., from Flask request.files)
            data_stream = file_data
            # Jump to the end to get file length, then reset back to the start
            data_stream.seek(0, 2)
            data_length = data_stream.tell()
            data_stream.seek(0)

        # Execute upload
        minio_client.put_object(
            bucket_name=bucket_name,
            object_name=object_name,
            data=data_stream,
            length=data_length,
            content_type=mimetype
        )
        
        # Construct public access URL
        scheme = "https" if minio_cfg['use_ssl'] else "http"
        url = f"{scheme}://{minio_cfg['endpoint']}:{minio_cfg['port']}/{bucket_name}/{object_name}"
        return url
        
    except Exception as err:
        print(f"❌ MinIO upload error for {object_name}: {str(err)}")
        raise err