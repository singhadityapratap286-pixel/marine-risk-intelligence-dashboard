from flask import Blueprint
from src.modules.gis import controllers as gis_controller
from src.middleware.auth import authenticate, authorize

# Create the GIS blueprint
gis_bp = Blueprint('gis', __name__)

@gis_bp.route('/layers', methods=['GET'])
def get_layers():
    return gis_controller.get_layers()

@gis_bp.route('/layers/<int:layer_id>', methods=['GET'])
def get_layer_by_id(layer_id):
    return gis_controller.get_layer_by_id(layer_id)

@gis_bp.route('/layers', methods=['POST'])
@authenticate
@authorize('admin')
def create_layer():
    return gis_controller.create_layer()

@gis_bp.route('/coastlines', methods=['GET'])
def get_coastlines():
    return gis_controller.get_coastlines()

@gis_bp.route('/risk-zones', methods=['GET'])
def get_risk_zones():
    return gis_controller.get_risk_zones()