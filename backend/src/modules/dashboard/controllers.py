from flask import request, jsonify
from src.modules.dashboard import services as dashboard_service

def get_summary():
    """
    Fetch high-level summary data for the dashboard.
    """
    data = dashboard_service.get_summary()
    return jsonify({
        "success": True, 
        "data": data
    }), 200

def get_timeline():
    """
    Fetch timeline data for the dashboard charts.
    Supports ?days=30 (defaults to 30)
    """
    # Flask automatically converts the 'days' query parameter to an int, defaulting to 30
    days = request.args.get('days', default=30, type=int)
    
    data = dashboard_service.get_timeline(days=days)
    return jsonify({
        "success": True, 
        "count": len(data), 
        "data": data
    }), 200
def get_impact():
    """
    Fetch impact data for the dashboard.
    """
    data = dashboard_service.get_impact()
    return jsonify({
        "success": True, 
        "data": data
    }), 200