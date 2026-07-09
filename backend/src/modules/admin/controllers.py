from flask import request, jsonify, current_app
from src.modules.admin import services as admin_service
from src.middleware.error_handler import AppError

def get_reports():
    """
    Fetch all community reports for admin review.
    Supports ?status=pending&limit=10&offset=0
    """
    status = request.args.get('status')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    
    data = admin_service.get_admin_reports(status=status, limit=limit, offset=offset)
    return jsonify({"success": True, "data": data}), 200

def review_report(report_id):
    """
    Admin reviews and approves/rejects a report.
    """
    from flask import g # Import g to get the user attached by the auth middleware
    
    data = request.get_json()
    action = data.get('action')
    
    if action not in ['approved', 'rejected']:
        raise AppError("Action must be 'approved' or 'rejected'", 400)

    result = admin_service.review_report(
        report_id=report_id, 
        admin_id=g.user['id'], 
        review_data=data
    )
    
    # Broadcast via Socket.IO if approved
    if action == 'approved':
        socketio = current_app.extensions.get('socketio')
        if socketio:
            socketio.emit('report:approved', {'id': report_id})
            
    return jsonify({
        "success": True, 
        "message": f"Report {action}.", 
        "data": result
    }), 200

def get_users():
    """
    Fetch all registered users.
    Supports query parameters like ?role=reporter
    """
    query_params = request.args.to_dict()
    users = admin_service.get_users(query_params)
    
    return jsonify({
        "success": True, 
        "count": len(users), 
        "data": users
    }), 200

def toggle_user(user_id):
    """
    Activate or deactivate a user account.
    """
    result = admin_service.toggle_user_status(user_id)
    status_text = "activated" if result['is_active'] else "deactivated"
    
    return jsonify({
        "success": True, 
        "message": f"User {status_text}.", 
        "data": result
    }), 200

def get_stats():
    """
    Fetch high-level platform statistics for the admin dashboard.
    """
    stats = admin_service.get_platform_stats()
    return jsonify({"success": True, "data": stats}), 200