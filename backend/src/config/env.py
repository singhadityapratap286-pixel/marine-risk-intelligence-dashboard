import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load environment variables from the .env file into os.environ
load_dotenv()

# Environment configuration validator
# Centralizes all env variable access with defaults and validation
env = {
    "server": {
        "env": os.getenv("NODE_ENV", "development"),
        "port": int(os.getenv("PORT", "5000")),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:3000"),
    },
    
    "jwt": {
        "secret": os.getenv("JWT_SECRET", "dev_secret_change_in_production"),
        "expires_in": os.getenv("JWT_EXPIRES_IN", "7d"),
        "refresh_secret": os.getenv("JWT_REFRESH_SECRET", "dev_refresh_secret"),
        "refresh_expires_in": os.getenv("JWT_REFRESH_EXPIRES_IN", "30d"),
    },
    
    "db": {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "name": os.getenv("DB_NAME", "marine_risk_db"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", "postgres"),
        "ssl": os.getenv("DB_SSL", "false").lower() == "true",
    },
    
    "redis": {
        "host": os.getenv("REDIS_HOST", "localhost"),
        "port": int(os.getenv("REDIS_PORT", "6379")),
        "password": os.getenv("REDIS_PASSWORD"),  # Defaults to None in Python if not provided
    },
    
    "minio": {
        "endpoint": os.getenv("MINIO_ENDPOINT", "localhost"),
        "port": int(os.getenv("MINIO_PORT", "9000")),
        "access_key": os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
        "secret_key": os.getenv("MINIO_SECRET_KEY", "minioadmin"),
        "bucket": os.getenv("MINIO_BUCKET", "marine-risk-files"),
        "use_ssl": os.getenv("MINIO_USE_SSL", "false").lower() == "true",
    },
    
    "noaa": {
        "erddap_base_url": os.getenv("NOAA_ERDDAP_BASE_URL", "https://coastwatch.pfeg.noaa.gov/erddap"),
        "dataset_id": os.getenv("NOAA_DATASET_ID", "jplMURSST41"),
        "auto_pull_threshold_days": int(os.getenv("NOAA_AUTO_PULL_THRESHOLD_DAYS", "15")),
    },
    
    "upload": {
        "max_file_size_mb": int(os.getenv("MAX_FILE_SIZE_MB", "50")),
        "upload_dir": os.getenv("UPLOAD_DIR", "./uploads"),
    },
    
    "admin": {
        "email": os.getenv("ADMIN_EMAIL", "admin@marinedashboard.com"),
        "password": os.getenv("ADMIN_PASSWORD", "Admin@123"),
    },
}