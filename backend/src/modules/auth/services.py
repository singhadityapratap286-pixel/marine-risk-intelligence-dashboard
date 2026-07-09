import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from src.config.database import db
from src.config.env import env
from src.middleware.error_handler import AppError

def generate_tokens(user_id, role):
    """
    Generate both access and refresh tokens for a user
    """
    jwt_cfg = env['jwt']
    
    # Calculate expiration times
    # Assuming expiresIn is like '7d' and refreshExpiresIn is like '30d'
    # For a real production app, you might want a more robust parser here
    access_days = int(jwt_cfg['expires_in'].replace('d', ''))
    refresh_days = int(jwt_cfg['refresh_expires_in'].replace('d', ''))
    
    access_exp = datetime.now(timezone.utc) + timedelta(days=access_days)
    refresh_exp = datetime.now(timezone.utc) + timedelta(days=refresh_days)

    access_token = jwt.encode(
        {"userId": user_id, "role": role, "exp": access_exp},
        jwt_cfg['secret'],
        algorithm="HS256"
    )

    refresh_token = jwt.encode(
        {"userId": user_id, "type": "refresh", "exp": refresh_exp},
        jwt_cfg['refresh_secret'],
        algorithm="HS256"
    )

    return {"accessToken": access_token, "refreshToken": refresh_token}


def register(email, password, full_name, role='reporter'):
    """
    Register a new user
    """
    email = email.lower()
    
    # Check if email already exists
    existing = db.session.execute(
        text("SELECT id FROM users WHERE email = :email"), 
        {"email": email}
    ).fetchone()
    
    if existing:
        raise AppError('An account with this email already exists.', 409)

    # Hash password (bcrypt returns bytes, so we decode it to a UTF-8 string)
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create user
    result = db.session.execute(
        text("""
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (:email, :hash, :name, :role)
            RETURNING id, email, full_name, role, created_at
        """),
        {"email": email, "hash": password_hash, "name": full_name, "role": role}
    ).fetchone()

    user = dict(result._mapping)
    tokens = generate_tokens(user['id'], user['role'])

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    db.session.execute(
        text("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:uid, :token, :exp)"),
        {"uid": user['id'], "token": tokens['refreshToken'], "exp": expires_at}
    )
    db.session.commit()

    return {"user": user, "tokens": tokens}


def login(email, password):
    """
    Login with email and password
    """
    email = email.lower()
    
    result = db.session.execute(
        text("SELECT id, email, full_name, role, password_hash, is_active FROM users WHERE email = :email"),
        {"email": email}
    ).fetchone()

    if not result:
        raise AppError('Invalid email or password.', 401)
        
    user = dict(result._mapping)

    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        raise AppError('Invalid email or password.', 401)

    if not user['is_active']:
        raise AppError('Your account has been deactivated. Please contact support.', 403)

    # Update last login
    db.session.execute(
        text("UPDATE users SET last_login = NOW() WHERE id = :uid"), 
        {"uid": user['id']}
    )

    tokens = generate_tokens(user['id'], user['role'])

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    db.session.execute(
        text("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:uid, :token, :exp)"),
        {"uid": user['id'], "token": tokens['refreshToken'], "exp": expires_at}
    )
    db.session.commit()

    # Return user without sensitive fields
    user.pop('password_hash', None)
    return {"user": user, "tokens": tokens}


def refresh_access_token(refresh_token):
    """
    Refresh access token using refresh token
    """
    jwt_cfg = env['jwt']
    
    try:
        # We don't need the payload, just need to ensure it doesn't throw ExpiredSignatureError
        jwt.decode(refresh_token, jwt_cfg['refresh_secret'], algorithms=["HS256"])
    except Exception:
        raise AppError('Invalid or expired refresh token. Please log in again.', 401)

    # Check token exists in DB and not expired
    result = db.session.execute(
        text("""
            SELECT rt.id, rt.user_id, u.email, u.role, u.is_active
            FROM refresh_tokens rt
            JOIN users u ON rt.user_id = u.id
            WHERE rt.token = :token AND rt.expires_at > NOW()
        """),
        {"token": refresh_token}
    ).fetchone()

    if not result:
        raise AppError('Session expired. Please log in again.', 401)

    user_data = dict(result._mapping)

    if not user_data['is_active']:
        raise AppError('Account deactivated.', 403)

    # Issue new access token only
    access_days = int(jwt_cfg['expires_in'].replace('d', ''))
    access_exp = datetime.now(timezone.utc) + timedelta(days=access_days)
    
    access_token = jwt.encode(
        {"userId": user_data['user_id'], "role": user_data['role'], "exp": access_exp},
        jwt_cfg['secret'],
        algorithm="HS256"
    )

    return {"accessToken": access_token}


def logout(refresh_token):
    """
    Logout — invalidate refresh token
    """
    if refresh_token:
        db.session.execute(
            text("DELETE FROM refresh_tokens WHERE token = :token"),
            {"token": refresh_token}
        )
        db.session.commit()


def get_profile(user_id):
    """
    Get user profile
    """
    result = db.session.execute(
        text("SELECT id, email, full_name, role, is_verified, avatar_url, last_login, created_at FROM users WHERE id = :uid"),
        {"uid": user_id}
    ).fetchone()
    
    if not result:
        raise AppError('User not found.', 404)
        
    return dict(result._mapping)