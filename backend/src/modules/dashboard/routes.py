from flask import Blueprint
from src.modules.dashboard import controllers as dashboard_controller

# Create the dashboard blueprint
dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    """
    Fetch high-level summary data for the dashboard.
    """
    return dashboard_controller.get_summary()

@dashboard_bp.route('/timeline', methods=['GET'])
def get_timeline():
    """
    Fetch timeline data for the dashboard charts.
    """
    return dashboard_controller.get_timeline()

@dashboard_bp.route('/impact', methods=['GET'])
def get_impact():
    """
    Fetch impact data for the dashboard.
    (Make sure you have a get_impact function in your controllers.py!)
    """
    return dashboard_controller.get_impact()