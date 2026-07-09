import uuid
from flask import request, jsonify, g
from src.modules.reports import services as reports_service
from src.middleware.error_handler import AppError
from src.config.storage import upload_file
from src.middleware.upload import validate_media_upload

def submit_report():
    """
    POST /api/reports
    """
    data = request.get_json()
    
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    incident_type = data.get('incidentType')
    title = data.get('title')
    description = data.get('description')
    severity = data.get('severity', 'medium')

    if not all([latitude, longitude, incident_type, title, description]):
        raise AppError('latitude, longitude, incidentType, title, and description are required.', 400)

    try:
        lat = float(latitude)
        lon = float(longitude)
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise ValueError()
    except (TypeError, ValueError):
        raise AppError('Invalid latitude or longitude values.', 400)

    # g.user might not exist if the route is using optional auth, 
    # but we will enforce it via @authenticate in the routes
    reporter_id = g.user['id'] if hasattr(g, 'user') else None

    report = reports_service.submit_report(
        reporter_id=reporter_id,
        latitude=lat,
        longitude=lon,
        incident_type=incident_type,
        title=title,
        description=description,
        severity=severity,
        media_urls=[]
    )

    return jsonify({
        "success": True,
        "message": "Report submitted. It will be reviewed before appearing on the map.",
        "data": report,
    }), 201

def get_reports():
    """
    GET /api/reports
    """
    bbox = request.args.get('bbox')
    incident_type = request.args.get('incidentType')
    start_date = request.args.get('startDate')
    limit = request.args.get('limit', default=200, type=int)

    geojson = reports_service.get_public_reports(
        bbox=bbox, 
        incident_type=incident_type, 
        start_date=start_date, 
        limit=limit
    )

    return jsonify({
        "success": True, 
        "count": len(geojson['features']), 
        "data": geojson
    }), 200

def get_report(report_id):
    """
    GET /api/reports/<id>
    """
    report = reports_service.get_report_by_id(report_id)
    return jsonify({
        "success": True, 
        "data": report
    }), 200

def upload_media(report_id):
    """
    POST /api/reports/<id>/media
    """
    # 1. Validate files using our middleware helper
    valid_files = validate_media_upload()
    if not valid_files:
        raise AppError('No valid media files provided.', 400)

    # 2. Upload each file to MinIO
    urls = []
    for file in valid_files:
        # Create a unique path: reports/123/uuid_filename.jpg
        unique_id = str(uuid.uuid4())
        object_name = f"reports/{report_id}/{unique_id}_{file.filename}"
        
        # storage.py expects object_name, file_data (Flask FileStorage), mimetype
        url = upload_file(object_name, file, file.mimetype)
        urls.append(url)

    # 3. Update the database
    reporter_id = g.user['id']
    report = reports_service.add_media_to_report(report_id, reporter_id, urls)

    return jsonify({
        "success": True, 
        "message": "Media uploaded.", 
        "data": {"mediaUrls": report['media_urls']}
    }), 200