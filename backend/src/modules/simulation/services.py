import json
import time
from sqlalchemy import text
from src.config.database import db
from src.middleware.error_handler import AppError
from src.modules.simulation.engine import run_thermal_plume, run_heatwave_spread

def start_simulation(user_id, name, model_type, input_params):
    epicenter_lon = input_params.get('epicenterLon')
    epicenter_lat = input_params.get('epicenterLat')
    epicenter_temp = input_params.get('epicenterTemp')

    if epicenter_lon is None or epicenter_lat is None or epicenter_temp is None:
        raise AppError('epicenterLon, epicenterLat, and epicenterTemp are required.', 400)
        
    if not (-5.0 <= float(epicenter_temp) <= 45.0):
        raise AppError('epicenterTemp must be between -5°C and 45°C.', 400)

    sim_name = name or f"{model_type or 'thermal_plume'}_{int(time.time() * 1000)}"
    sim_model_type = model_type or 'thermal_plume'

    # 1. Create simulation record
    insert_query = text("""
        INSERT INTO simulations (initiated_by, name, model_type, input_params, status)
        VALUES (:user_id, :name, :model_type, :params, 'running')
        RETURNING id, created_at
    """)
    
    result = db.session.execute(insert_query, {
        "user_id": user_id,
        "name": sim_name,
        "model_type": sim_model_type,
        "params": json.dumps(input_params)
    }).fetchone()
    db.session.commit()
    
    simulation_id = result.id

    # 2. Run simulation synchronously
    try:
        if sim_model_type == 'heatwave_spread':
            result_geojson = run_heatwave_spread(input_params)
        else:
            result_geojson = run_thermal_plume(input_params)

        color_map = result_geojson.get('metadata', {}).get('colorMap', [])

        # 3. Store result
        update_query = text("""
            UPDATE simulations SET
             status = 'done',
             result_geojson = :geojson,
             color_map = :colormap,
             progress = 100,
             started_at = NOW(),
             completed_at = NOW()
            WHERE id = :id
        """)
        
        db.session.execute(update_query, {
            "geojson": json.dumps(result_geojson),
            "colormap": json.dumps(color_map),
            "id": simulation_id
        })
        db.session.commit()

        return {"simulationId": simulation_id, "status": "done", "result": result_geojson}

    except Exception as err:
        db.session.rollback()
        fail_query = text("UPDATE simulations SET status = 'failed', error_message = :err WHERE id = :id")
        db.session.execute(fail_query, {"err": str(err), "id": simulation_id})
        db.session.commit()
        raise AppError(f"Simulation failed: {str(err)}", 500)

def get_simulation(simulation_id):
    query = text("""
        SELECT id, name, model_type, input_params, status, progress, error_message, created_at, completed_at 
        FROM simulations WHERE id = :id
    """)
    result = db.session.execute(query, {"id": simulation_id}).fetchone()
    
    if not result:
        raise AppError('Simulation not found.', 404)
        
    return dict(result._mapping)

def get_simulation_result(simulation_id):
    query = text("SELECT id, model_type, result_geojson, color_map, status, completed_at FROM simulations WHERE id = :id")
    result = db.session.execute(query, {"id": simulation_id}).fetchone()
    
    if not result:
        raise AppError('Simulation not found.', 404)
        
    sim = dict(result._mapping)
    if sim['status'] != 'done':
        raise AppError(f"Simulation is {sim['status']}. Result not ready.", 400)
        
    # Safely parse JSON strings back into dictionaries for the frontend
    if isinstance(sim.get('result_geojson'), str):
        sim['result_geojson'] = json.loads(sim['result_geojson'])
    if isinstance(sim.get('color_map'), str):
        sim['color_map'] = json.loads(sim['color_map'])
        
    return sim

def get_history(user_id=None, limit=20):
    query = text("""
        SELECT id, name, model_type, input_params, status, progress, created_at, completed_at
        FROM simulations
        WHERE initiated_by = :user_id OR :user_id IS NULL
        ORDER BY created_at DESC
        LIMIT :limit
    """)
    
    result = db.session.execute(query, {"user_id": user_id, "limit": limit}).fetchall()
    return [dict(row._mapping) for row in result]