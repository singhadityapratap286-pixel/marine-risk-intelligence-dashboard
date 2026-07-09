import re
from functools import wraps
from flask import Blueprint, request
from src.modules.auth import controllers as auth_controller
from src.middleware.auth import authenticate
from src.middleware.rate_limiter import auth_limiter
from src.middleware.error_handler import AppError

# Create the auth blueprint
auth_bp = Blueprint('auth', __name__)

# --- Custom Validation Decorators ---

def validate_register(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json() or {}
        email = data.get('email', '')
        password = data.get('password', '')
        full_name = data.get('fullName', '')

        errors = []
        
        # Email validation
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            errors.append({"field": "email", "message": "A valid email address is required."})

        # Password validation (At least 8 chars, 1 uppercase, 1 lowercase, 1 number)
        if len(password) < 8:
            errors.append({"field": "password", "message": "Password must be at least 8 characters."})
        elif not re.search(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", password):
            errors.append({"field": "password", "message": "Password must contain uppercase, lowercase, and a number."})

        # Full name validation
        if len(full_name.strip()) < 2 or len(full_name.strip()) > 100:
            errors.append({"field": "fullName", "message": "Full name must be between 2 and 100 characters."})

        if errors:
            raise AppError("Validation failed", 400, errors)

        return f(*args, **kwargs)
    return decorated_function

def validate_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json() or {}
        email = data.get('email', '')
        password = data.get('password', '')

        errors = []
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            errors.append({"field": "email", "message": "A valid email address is required."})
        if not password:
            errors.append({"field": "password", "message": "Password is required."})

        if errors:
            raise AppError("Validation failed", 400, errors)

        return f(*args, **kwargs)
    return decorated_function


# --- Routes ---

@auth_bp.route('/register', methods=['POST'])
@auth_limiter
@validate_register
def register():
    """
    Register a new user account
    """
    return auth_controller.register()

@auth_bp.route('/login', methods=['POST'])
@auth_limiter
@validate_login
def login():
    """
    Login with email and password
    """
    return auth_controller.login()

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """
    Refresh access token
    """
    return auth_controller.refresh_token()

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout and invalidate refresh token
    """
    return auth_controller.logout()

@auth_bp.route('/me', methods=['GET'])
@authenticate
def get_me():
    """
    Get current user profile
    """
    return auth_controller.get_me()