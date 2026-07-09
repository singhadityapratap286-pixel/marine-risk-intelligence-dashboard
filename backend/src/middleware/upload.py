import os
import time
import random
from flask import request
from werkzeug.utils import secure_filename
from src.config.env import env
from src.middleware.error_handler import AppError

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)

def handle_sst_upload():
    """
    Validates and saves a large SST dataset to disk.
    Call this inside your route.
    """
    if 'dataset' not in request.files:
        raise AppError("No dataset file provided", 400)
        
    file = request.files['dataset']
    if file.filename == '':
        raise AppError("No selected file", 400)

    # Validate extension
    allowed_exts = ['.csv', '.nc', '.json', '.geojson', '.txt']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise AppError(f"File type not allowed. Accepted: {', '.join(allowed_exts)}", 400)

    # Validate size (by moving cursor to end of file, reading size, and resetting)
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    max_size = env['upload']['max_file_size_mb'] * 1024 * 1024
    if size > max_size:
        raise AppError(f"File too large. Maximum size: {env['upload']['max_file_size_mb']}MB", 400)

    # Save to disk
    upload_dir = os.path.join(env['upload']['upload_dir'], 'sst')
    ensure_dir(upload_dir)
    
    unique_name = f"sst_{int(time.time())}-{random.randint(0, int(1e9))}{ext}"
    safe_filename = secure_filename(unique_name)
    file_path = os.path.join(upload_dir, safe_filename)
    
    file.save(file_path)
    return file_path

def validate_media_upload():
    """
    Validates small media uploads before storing in memory/MinIO.
    Returns a list of validated Flask FileStorage objects.
    """
    files = request.files.getlist('media')
    if not files or len(files) == 0 or files[0].filename == '':
        return [] # No files provided
        
    if len(files) > 5:
        raise AppError("Maximum 5 media files allowed", 400)

    allowed_mimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
    max_size = 20 * 1024 * 1024 # 20MB per file
    
    valid_files = []
    for file in files:
        if file.mimetype not in allowed_mimes:
            raise AppError('Only images (JPEG, PNG, WebP) and videos (MP4, MOV) are allowed.', 400)
            
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        
        if size > max_size:
            raise AppError("Media file too large. Maximum 20MB per file", 400)
            
        valid_files.append(file)
        
    return valid_files