from flask import request, jsonify, current_app, g
from src.modules.alerts import services as alerts_service
from src.middleware.error_handler import AppError

def get_alerts():
    """
    Fetch all alerts with optional filtering.
    Supports ?severity=high&type=storm&limit=10
    """
    severity = request.args.get('severity')
    alert_type = request.args.get('type')
    limit = request.args.get('limit', type=int)
    
    alerts = alerts_service.get_alerts(severity=severity, alert_type=alert_type, limit=limit)
    return jsonify({
        "success": True, 
        "count": len(alerts), 
        "data": alerts
    }), 200

def get_alert(alert_id):
    """
    Fetch a single alert by ID.
    """
    alert = alerts_service.get_alert_by_id(alert_id)
    return jsonify({"success": True, "data": alert}), 200

def create_alert():
    """
    Create a new manual alert and broadcast it to connected clients.
    """
    data = request.get_json()
    
    alert_type = data.get('alertType')
    severity = data.get('severity')
    title = data.get('title')
    message = data.get('message')
    
    # Validation
    if not alert_type or not severity or not title or not message:
        raise AppError('alertType, severity, title, and message are required.', 400)
        
    alert = alerts_service.create_alert(
        alert_type=alert_type,
        severity=severity,
        title=title,
        message=message,
        center_lon=data.get('centerLon'),
        center_lat=data.get('centerLat'),
        metadata=data.get('metadata')
    )

    # Broadcast via Socket.IO
    socketio = current_app.extensions.get('socketio')
    if socketio:
        socketio.emit('alert:new', alert)

    return jsonify({
        "success": True, 
        "message": "Alert created.", 
        "data": alert
    }), 201

def resolve_alert(alert_id):
    """
    Mark an active alert as resolved and notify clients.
    """
    # g.user is attached by the @authenticate middleware
    result = alerts_service.resolve_alert(alert_id, g.user['id'])
    
    # Broadcast via Socket.IO
    socketio = current_app.extensions.get('socketio')
    if socketio:
        # We use .get() in case the date object needs to be formatted as a string for JSON
        socketio.emit('alert:resolved', {
            'id': alert_id, 
            'resolvedAt': result.get('resolved_at').isoformat() if result.get('resolved_at') else None
        })
        
    return jsonify({
        "success": True, 
        "message": "Alert resolved.", 
        "data": result
    }), 200