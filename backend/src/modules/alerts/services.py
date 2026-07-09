import json
from sqlalchemy import text
from src.config.database import db
from src.config.redis import delete_cache
from src.middleware.error_handler import AppError

def get_alerts(severity=None, alert_type=None, limit=50):
    """
    Get all active alerts
    """
    base_query = """
        SELECT
         id, alert_type, severity, title, message,
         ST_AsGeoJSON(affected_zone) AS affected_zone,
         ST_AsGeoJSON(center_point) AS center_point,
         is_active, triggered_at, resolved_at, metadata
        FROM alerts
        WHERE 1=1
    """
    params = {"limit": limit or 50}

    if severity:
        base_query += " AND severity = :severity"
        params["severity"] = severity
    if alert_type:
        base_query += " AND alert_type = :alert_type"
        params["alert_type"] = alert_type

    base_query += " ORDER BY triggered_at DESC LIMIT :limit"

    result = db.session.execute(text(base_query), params).fetchall()

    formatted_alerts = []
    for row in result:
        row_dict = dict(row._mapping)
        # Parse GeoJSON strings into Python dicts for the frontend
        if row_dict.get('affected_zone'):
            row_dict['affected_zone'] = json.loads(row_dict['affected_zone'])
        if row_dict.get('center_point'):
            row_dict['center_point'] = json.loads(row_dict['center_point'])
        formatted_alerts.append(row_dict)

    return formatted_alerts

def get_alert_by_id(alert_id):
    """
    Get single alert
    """
    query = text("""
        SELECT *, 
        ST_AsGeoJSON(affected_zone) AS affected_zone_geojson, 
        ST_AsGeoJSON(center_point) AS center_point_geojson
        FROM alerts WHERE id = :id
    """)
    
    result = db.session.execute(query, {"id": alert_id}).fetchone()
    
    if not result:
        raise AppError('Alert not found.', 404)
        
    row_dict = dict(result._mapping)
    if row_dict.get('affected_zone_geojson'):
        row_dict['affected_zone_geojson'] = json.loads(row_dict['affected_zone_geojson'])
    if row_dict.get('center_point_geojson'):
        row_dict['center_point_geojson'] = json.loads(row_dict['center_point_geojson'])
        
    return row_dict

def create_alert(alert_type, severity, title, message, affected_zone_wkt=None, 
                 center_lon=None, center_lat=None, source_dataset_id=None, 
                 source_report_id=None, source_anomaly_id=None, metadata=None):
    """
    Create a new alert (manual or auto-triggered)
    """
    params = {
        "type": alert_type,
        "severity": severity,
        "title": title,
        "message": message,
        "ds_id": source_dataset_id,
        "rep_id": source_report_id,
        "anom_id": source_anomaly_id,
        "meta": json.dumps(metadata or {})
    }

    # Handle PostGIS spatial data
    affected_zone_sql = 'NULL'
    if affected_zone_wkt:
        affected_zone_sql = "ST_GeomFromText(:wkt, 4326)"
        params["wkt"] = affected_zone_wkt

    center_sql = 'NULL'
    if center_lon is not None and center_lat is not None:
        center_sql = "ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)"
        params["lon"] = center_lon
        params["lat"] = center_lat

    query = text(f"""
        INSERT INTO alerts (
            alert_type, severity, title, message, affected_zone, center_point, 
            source_dataset_id, source_report_id, source_anomaly_id, metadata
        )
        VALUES (
            :type, :severity, :title, :message, {affected_zone_sql}, {center_sql}, 
            :ds_id, :rep_id, :anom_id, :meta
        )
        RETURNING *
    """)

    result = db.session.execute(query, params).fetchone()
    db.session.commit()

    # Clear the dashboard cache just like Node did
    delete_cache('dashboard:summary')
    
    return dict(result._mapping)

def resolve_alert(alert_id, resolved_by):
    """
    Resolve an alert
    """
    query = text("""
        UPDATE alerts 
        SET is_active = false, resolved_at = NOW(), resolved_by = :resolved_by
        WHERE id = :id AND is_active = true
        RETURNING id, resolved_at
    """)
    
    result = db.session.execute(query, {"resolved_by": resolved_by, "id": alert_id}).fetchone()
    db.session.commit()

    if not result:
        raise AppError('Alert not found or already resolved.', 404)
        
    delete_cache('dashboard:summary')
    return dict(result._mapping)

def generate_anomaly_alerts(dataset_id):
    """
    Auto-generate alerts from new anomaly zones.
    Called after SST dataset ingestion.
    """
    query = text("""
        SELECT az.*, d.name AS dataset_name
        FROM anomaly_zones az
        JOIN sst_datasets d ON az.dataset_id = d.id
        WHERE az.dataset_id = :dataset_id
          AND az.severity IN ('high', 'critical')
          AND NOT EXISTS (
            SELECT 1 FROM alerts WHERE source_anomaly_id = az.id
          )
    """)
    
    zones = db.session.execute(query, {"dataset_id": dataset_id}).fetchall()
    
    created = []
    for zone_row in zones:
        zone = dict(zone_row._mapping)
        
        # Define alert variables based on severity
        alert_type = 'thermal_spike' if zone['severity'] == 'critical' else 'sst_anomaly'
        title = f"{zone['severity'].upper()} SST Anomaly Detected"
        
        avg_temp = round(zone.get('avg_temperature', 0), 1) if zone.get('avg_temperature') else 'N/A'
        max_temp = round(zone.get('max_temperature', 0), 1) if zone.get('max_temperature') else 'N/A'
        message = f"Anomaly zone detected with avg temperature {avg_temp}°C (max: {max_temp}°C). Dataset: {zone['dataset_name']}."
        
        meta = {
            "avgTemperature": zone.get('avg_temperature'),
            "maxTemperature": zone.get('max_temperature'),
            "anomalyCount": zone.get('anomaly_count'),
            "datasetName": zone['dataset_name']
        }
        
        alert = create_alert(
            alert_type=alert_type,
            severity=zone['severity'],
            title=title,
            message=message,
            source_dataset_id=dataset_id,
            source_anomaly_id=zone['id'],
            metadata=meta
        )
        created.append(alert)
        
    return created