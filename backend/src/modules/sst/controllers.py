import os
import threading
from flask import request, jsonify, g, current_app
from src.modules.sst import services as sst_service
from src.middleware.error_handler import AppError
from src.middleware.upload import handle_sst_upload

def run_ingestion_async(app, dataset_id, file_path, user_id):
    """Helper to run the ingestion in a background thread"""
    with app.app_context():
        try:
            stats = sst_service.ingest_dataset(dataset_id, file_path, user_id)
            print(f"✅ Dataset {dataset_id} ingested: {stats['totalRecords']} records")
        except Exception as e:
            print(f"❌ Dataset {dataset_id} ingestion failed: {str(e)}")

def upload_dataset():
    # 1. Save file to disk using our custom middleware helper
    file_path = handle_sst_upload()
    
    data = request.form
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        raise AppError('Dataset name is required.', 400)

    # 2. Register in DB
    from src.config.database import db
    from sqlalchemy import text
    
    file_ext = os.path.splitext(file_path)[1].replace('.', '')
    file_size = os.path.getsize(file_path)
    user_id = g.user['id'] if hasattr(g, 'user') else None

    result = db.session.execute(
        text("""
            INSERT INTO sst_datasets (name, description, uploaded_by, source, file_path, file_type, file_size_bytes, status)
            VALUES (:name, :desc, :user_id, 'team_upload', :path, :ext, :size, 'processing')
            RETURNING id
        """),
        {"name": name, "desc": description, "user_id": user_id, "path": file_path, "ext": file_ext, "size": file_size}
    ).fetchone()
    
    db.session.commit()
    dataset_id = result.id

    # 3. Process asynchronously using a background thread
    app = current_app._get_current_object()
    thread = threading.Thread(target=run_ingestion_async, args=(app, dataset_id, file_path, user_id))
    thread.start()

    return jsonify({
        "success": True,
        "message": "Dataset uploaded. Processing in background.",
        "data": {"datasetId": dataset_id, "status": "processing"}
    }), 202


def get_datasets():
    datasets = sst_service.get_datasets()
    return jsonify({"success": True, "data": datasets}), 200


def get_readings():
    bbox = request.args.get('bbox')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    min_temp = request.args.get('minTemp', type=float)
    max_temp = request.args.get('maxTemp', type=float)
    only_anomalies = request.args.get('onlyAnomalies')
    limit = request.args.get('limit', default=500, type=int)
    offset = request.args.get('offset', default=0, type=int)

    readings = sst_service.get_readings(
        bbox=bbox, start_date=start_date, end_date=end_date, 
        min_temp=min_temp, max_temp=max_temp, 
        only_anomalies=only_anomalies, limit=limit, offset=offset
    )
    return jsonify({"success": True, "count": len(readings), "data": readings}), 200


def get_anomalies():
    severity = request.args.get('severity')
    dataset_id = request.args.get('datasetId')
    
    geojson = sst_service.get_anomaly_zones_geojson(severity=severity, dataset_id=dataset_id)
    return jsonify({"success": True, "data": geojson}), 200


def get_heatmap():
    dataset_id = request.args.get('datasetId')
    grid_size = request.args.get('gridSize', default=0.5, type=float)
    
    data = sst_service.get_heatmap_data(dataset_id=dataset_id, grid_size=grid_size)
    return jsonify({"success": True, "count": len(data), "data": data}), 200


def get_trend():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    radius_km = request.args.get('radiusKm', default=50, type=float)
    
    if lat is None or lon is None:
        raise AppError('lat and lon query params are required.', 400)
        
    trend = sst_service.get_trend(lat=lat, lon=lon, radius_km=radius_km)
    return jsonify({"success": True, "data": trend}), 200