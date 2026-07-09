from flask import Blueprint
from src.modules.alerts import controllers as alerts_controller
from src.middleware.auth import authenticate, authorize

# Create the alerts blueprint
alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    """Public route: Fetch all alerts"""
    return alerts_controller.get_alerts()

@alerts_bp.route('/<int:alert_id>', methods=['GET'])
def get_alert(alert_id):
    """Public route: Fetch a single alert"""
    return alerts_controller.get_alert(alert_id)

@alerts_bp.route('/', methods=['POST'])
@authenticate
@authorize('admin')
def create_alert():
    """Protected route: Admin creates a new alert"""
    return alerts_controller.create_alert()

@alerts_bp.route('/<int:alert_id>/resolve', methods=['PATCH'])
@authenticate
@authorize('admin')
def resolve_alert(alert_id):
    """Protected route: Admin resolves an active alert"""
    return alerts_controller.resolve_alert(alert_id)