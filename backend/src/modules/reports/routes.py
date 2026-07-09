from flask import Blueprint
from src.modules.reports import controllers as reports_controller
from src.middleware.auth import authenticate
from src.middleware.rate_limiter import report_limiter

# Create the reports blueprint
reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/', methods=['GET'])
def get_reports():
    return reports_controller.get_reports()

@reports_bp.route('/<int:report_id>', methods=['GET'])
def get_report(report_id):
    return reports_controller.get_report(report_id)

@reports_bp.route('/', methods=['POST'])
@authenticate
@report_limiter
def submit_report():
    return reports_controller.submit_report()

@reports_bp.route('/<int:report_id>/media', methods=['POST'])
@authenticate
def upload_media(report_id):
    return reports_controller.upload_media(report_id)