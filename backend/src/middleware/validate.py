from functools import wraps
from flask import request
from src.middleware.error_handler import AppError

def validate_request(required_fields):
    """
    Ensures the incoming JSON body contains all required fields.
    Usage: @validate_request(['email', 'password'])
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                raise AppError("Request body must be JSON", 400)
                
            data = request.get_json()
            missing = []
            
            for field in required_fields:
                if field not in data or data[field] is None or data[field] == '':
                    missing.append({"field": field, "message": "This field is required"})
                    
            if missing:
                raise AppError("Validation failed", 400, missing)
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator