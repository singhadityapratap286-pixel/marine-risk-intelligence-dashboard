import jwt
from functools import wraps
from flask import request, g
from sqlalchemy import text
from src.config.database import db
from src.config.env import env
from src.middleware.error_handler import AppError

def authenticate(f):
    """Verify JWT token and attach user to request (g.user)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Accept token from Authorization header or cookie
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'accessToken' in request.cookies:
            token = request.cookies.get('accessToken')

        if not token:
            raise AppError('Authentication required. Please log in.', 401)

        try:
            # Verify token
            decoded = jwt.decode(token, env['jwt']['secret'], algorithms=["HS256"])
            
            # Check user still exists and is active
            result = db.session.execute(
                text("SELECT id, email, full_name, role, is_active FROM users WHERE id = :user_id"),
                {"user_id": decoded['userId']}
            ).fetchone()

            if not result:
                raise AppError('User account not found.', 401)
                
            # Convert SQLAlchemy Row to dictionary
            user = result._asdict()

            if not user['is_active']:
                raise AppError('Your account has been deactivated. Contact support.', 403)

            # Attach user to Flask's global request context
            g.user = user
            
        except jwt.ExpiredSignatureError:
            raise AppError('Your session has expired. Please log in again.', 401)
        except jwt.InvalidTokenError:
            raise AppError('Invalid authentication token. Please log in again.', 401)

        return f(*args, **kwargs)
    return decorated_function

def authorize(*roles):
    """Restrict access to specific roles. Usage: @authorize('admin', 'reporter')"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'user') or not g.user:
                raise AppError('Authentication required.', 401)
            
            if g.user['role'] not in roles:
                raise AppError(f"Access denied. Required role: {' or '.join(roles)}", 403)
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def optional_auth(f):
    """Optional auth — attaches user if token present but doesn't block"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if token:
            try:
                decoded = jwt.decode(token, env['jwt']['secret'], algorithms=["HS256"])
                result = db.session.execute(
                    text("SELECT id, email, full_name, role FROM users WHERE id = :user_id AND is_active = true"),
                    {"user_id": decoded['userId']}
                ).fetchone()
                
                if result:
                    g.user = result._asdict()
            except Exception:
                pass # Silently ignore invalid token
                
        return f(*args, **kwargs)
    return decorated_function