from flask import Blueprint
from src.modules.admin import controllers as admin_controller
from src.middleware.auth import authenticate, authorize

# Create the admin blueprint
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/reports', methods=['GET'])
@authenticate
@authorize('admin')
def get_reports():
    return admin_controller.get_reports()

@admin_bp.route('/reports/<int:report_id>', methods=['PATCH'])
@authenticate
@authorize('admin')
def review_report(report_id):
    return admin_controller.review_report(report_id)

@admin_bp.route('/users', methods=['GET'])
@authenticate
@authorize('admin')
def get_users():
    return admin_controller.get_users()

@admin_bp.route('/users/<int:user_id>/toggle', methods=['PATCH'])
@authenticate
@authorize('admin')
def toggle_user(user_id):
    return admin_controller.toggle_user(user_id)

@admin_bp.route('/stats', methods=['GET'])
@authenticate
@authorize('admin')
def get_stats():
    return admin_controller.get_stats()