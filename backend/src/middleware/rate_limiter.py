from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize the global limiter. We will attach this to the app in app.py later.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300 per 15 minutes"],
    storage_uri="memory://" # Can be switched to Redis later
)

# Custom limit decorators to apply to specific routes
auth_limiter = limiter.limit("10 per 15 minutes", error_message="Too many login attempts. Please wait 15 minutes.")
upload_limiter = limiter.limit("20 per 1 hour", error_message="Upload limit exceeded. Maximum 20 uploads per hour.")
report_limiter = limiter.limit("15 per 1 hour", error_message="Too many reports submitted. Please wait before submitting again.") 