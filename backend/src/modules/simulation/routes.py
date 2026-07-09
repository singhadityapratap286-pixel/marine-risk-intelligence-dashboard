from flask import Blueprint
from src.modules.simulation import controllers as simulation_controller
from src.middleware.auth import optional_auth

simulation_bp = Blueprint('simulation', __name__)

# History must be before /<int:simulation_id> to avoid route conflicts
@simulation_bp.route('/history', methods=['GET'])
@optional_auth
def get_history():
    return simulation_controller.get_history()

@simulation_bp.route('/run', methods=['POST'])
@optional_auth
def run_simulation():
    return simulation_controller.run_simulation()

@simulation_bp.route('/<int:simulation_id>', methods=['GET'])
def get_simulation(simulation_id):
    return simulation_controller.get_simulation(simulation_id)

@simulation_bp.route('/<int:simulation_id>/result', methods=['GET'])
def get_result(simulation_id):
    return simulation_controller.get_result(simulation_id)