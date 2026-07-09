from flask import request, jsonify, g
from src.modules.simulation import services as simulation_service
from src.middleware.error_handler import AppError

def run_simulation():
    data = request.get_json()
    name = data.get('name')
    model_type = data.get('modelType')
    input_params = data.get('inputParams')
    
    if not input_params:
        raise AppError('inputParams object is required.', 400)

    user_id = g.user['id'] if hasattr(g, 'user') and g.user else None

    result = simulation_service.start_simulation(
        user_id=user_id,
        name=name,
        model_type=model_type,
        input_params=input_params
    )

    return jsonify({
        "success": True,
        "message": "Simulation completed.",
        "data": result
    }), 201

def get_simulation(simulation_id):
    sim = simulation_service.get_simulation(simulation_id)
    return jsonify({"success": True, "data": sim}), 200

def get_result(simulation_id):
    result = simulation_service.get_simulation_result(simulation_id)
    return jsonify({"success": True, "data": result}), 200

def get_history():
    limit = request.args.get('limit', default=20, type=int)
    user_id = g.user['id'] if hasattr(g, 'user') and g.user else None
    
    history = simulation_service.get_history(user_id=user_id, limit=limit)
    return jsonify({"success": True, "count": len(history), "data": history}), 200