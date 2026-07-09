from flask import request, jsonify, g
from src.modules.auth import services as auth_service
from src.middleware.error_handler import AppError

def register():
    """
    POST /api/auth/register
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('fullName')

    result = auth_service.register(email=email, password=password, full_name=full_name)
    user = result['user']
    tokens = result['tokens']

    # Safely format dates for JSON response
    created_at = user['created_at'].isoformat() if hasattr(user['created_at'], 'isoformat') else user['created_at']

    return jsonify({
        "success": True,
        "message": "Account created successfully. Welcome to Marine Risk Intelligence!",
        "data": {
            "user": {
                "id": user['id'],
                "email": user['email'],
                "fullName": user['full_name'],
                "role": user['role'],
                "createdAt": created_at,
            },
            "tokens": tokens,
        },
    }), 201


def login():
    """
    POST /api/auth/login
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    result = auth_service.login(email=email, password=password)
    user = result['user']
    tokens = result['tokens']

    # Safely format dates for JSON response
    last_login = user['last_login'].isoformat() if hasattr(user['last_login'], 'isoformat') else user['last_login']

    return jsonify({
        "success": True,
        "message": "Logged in successfully.",
        "data": {
            "user": {
                "id": user['id'],
                "email": user['email'],
                "fullName": user['full_name'],
                "role": user['role'],
                "lastLogin": last_login,
            },
            "tokens": tokens,
        },
    }), 200


def refresh_token():
    """
    POST /api/auth/refresh
    """
    data = request.get_json()
    refresh_token_val = data.get('refreshToken')
    
    if not refresh_token_val:
        raise AppError('Refresh token required.', 400)
        
    result = auth_service.refresh_access_token(refresh_token_val)
    
    return jsonify({
        "success": True, 
        "data": result
    }), 200


def logout():
    """
    POST /api/auth/logout
    """
    data = request.get_json()
    refresh_token_val = data.get('refreshToken')
    
    auth_service.logout(refresh_token_val)
    
    return jsonify({
        "success": True, 
        "message": "Logged out successfully."
    }), 200


def get_me():
    """
    GET /api/auth/me
    """
    # g.user is securely attached by the @authenticate middleware
    profile = auth_service.get_profile(g.user['id'])
    
    return jsonify({
        "success": True,
        "data": {"user": profile},
    }), 200