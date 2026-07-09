from flask import Blueprint
from src.modules.sst import controllers as sst_controller
from src.middleware.auth import authenticate, authorize
from src.middleware.rate_limiter import upload_limiter

sst_bp = Blueprint('sst', __name__)

@sst_bp.route('/datasets', methods=['GET'])
def get_datasets():
    return sst_controller.get_datasets()

@sst_bp.route('/readings', methods=['GET'])
def get_readings():
    return sst_controller.get_readings()

@sst_bp.route('/anomalies', methods=['GET'])
def get_anomalies():
    return sst_controller.get_anomalies()

@sst_bp.route('/heatmap', methods=['GET'])
def get_heatmap():
    return sst_controller.get_heatmap()

@sst_bp.route('/trend', methods=['GET'])
def get_trend():
    return sst_controller.get_trend()

@sst_bp.route('/upload', methods=['POST'])
@authenticate
@authorize('admin', 'reporter')
@upload_limiter
def upload_dataset():
    return sst_controller.upload_dataset()