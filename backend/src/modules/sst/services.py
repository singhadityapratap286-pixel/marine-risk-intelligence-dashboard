import json
import math
from sqlalchemy import text
from src.config.database import db
from src.config.redis import set_cache, get_cache, delete_cache
from src.middleware.error_handler import AppError
from src.modules.sst.parser import parse_file, detect_anomalies, compute_stats
from src.modules.alerts.services import generate_anomaly_alerts

def ingest_dataset(dataset_id, file_path, uploaded_by):
    """
    Ingest an uploaded SST dataset file
    """
    db.session.execute(
        text("UPDATE sst_datasets SET status = 'processing' WHERE id = :id"),
        {"id": dataset_id}
    )
    db.session.commit()

    try:
        raw_records = parse_file(file_path)
        if not raw_records:
            raise AppError('No valid records found in dataset.', 400)

        records = detect_anomalies(raw_records, 2.0)

        # Calculate metadata
        dates = [r['recordedAt'] for r in records]
        date_start, date_end = min(dates), max(dates)
        
        lats = [r['lat'] for r in records]
        lons = [r['lon'] for r in records]
        min_lat, max_lat = min(lats), max(lats)
        min_lon, max_lon = min(lons), max(lons)
        bbox_wkt = f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, {max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"

        # Bulk insert using SQLAlchemy's list-of-dicts execution
        insert_query = text("""
            INSERT INTO sst_readings
            (location, temperature, recorded_at, depth_m, anomaly_score, is_anomaly, quality_flag, dataset_id)
            VALUES (
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 
                :temperature, :recordedAt, :depth, :anomalyScore, :isAnomaly, :qualityFlag, :dataset_id
            )
        """)

        # Inject dataset_id into all records before insert
        for r in records:
            r['dataset_id'] = dataset_id

        # Execute bulk insert
        db.session.execute(insert_query, records)

        # Update dataset metadata
        update_query = text("""
            UPDATE sst_datasets SET
             status = 'ready',
             total_readings = :total,
             date_range_start = :d_start,
             date_range_end = :d_end,
             bounding_box = ST_GeomFromText(:bbox, 4326)
            WHERE id = :id
        """)
        
        db.session.execute(update_query, {
            "total": len(records), "d_start": date_start, "d_end": date_end,
            "bbox": bbox_wkt, "id": dataset_id
        })
        
        db.session.commit()

        # Generate anomaly zones
        generate_anomaly_zones(dataset_id)
        
        # Trigger Alerts!
        generate_anomaly_alerts(dataset_id)

        # Invalidate cache
        delete_cache('sst:datasets')
        delete_cache('sst:heatmap')
        delete_cache('dashboard:summary')

        stats = compute_stats(records)
        anomaly_count = sum(1 for r in records if r.get('isAnomaly'))
        
        return {
            "totalRecords": len(records), 
            "anomalyCount": anomaly_count, 
            "stats": stats, 
            "dateStart": date_start, 
            "dateEnd": date_end
        }

    except Exception as err:
        db.session.rollback()
        db.session.execute(
            text("UPDATE sst_datasets SET status = 'failed', error_message = :err WHERE id = :id"),
            {"err": str(err), "id": dataset_id}
        )
        db.session.commit()
        raise err

def generate_anomaly_zones(dataset_id):
    """Cluster anomaly points into polygonal zones"""
    query = text("""
        WITH clustered AS (
            SELECT
                ST_ConvexHull(ST_Collect(location)) AS zone_geom,
                AVG(temperature) AS avg_temp,
                MAX(temperature) AS max_temp,
                MIN(temperature) AS min_temp,
                AVG(anomaly_score) AS avg_anomaly,
                COUNT(*) AS point_count,
                ST_Centroid(ST_Collect(location)) AS centroid
            FROM sst_readings
            WHERE dataset_id = :id
              AND is_anomaly = true
              AND ST_IsValid(location)
            GROUP BY ST_SnapToGrid(location, 2.0)
            HAVING COUNT(*) >= 3
        )
        INSERT INTO anomaly_zones (dataset_id, zone, center, avg_temperature, max_temperature, min_temperature, threshold_delta, anomaly_count, severity)
        SELECT
            :id, zone_geom, centroid, avg_temp, max_temp, min_temp, avg_anomaly, point_count::INTEGER,
            CASE
                WHEN avg_anomaly >= 4.0 THEN 'critical'
                WHEN avg_anomaly >= 3.0 THEN 'high'
                WHEN avg_anomaly >= 2.5 THEN 'medium'
                ELSE 'low'
            END
        FROM clustered
        WHERE zone_geom IS NOT NULL
    """)
    db.session.execute(query, {"id": dataset_id})
    db.session.commit()

def get_readings(bbox=None, start_date=None, end_date=None, min_temp=None, max_temp=None, only_anomalies=False, limit=500, offset=0):
    base_query = """
        SELECT
         id, ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude,
         temperature, recorded_at, depth_m, anomaly_score, is_anomaly, quality_flag, dataset_id
        FROM sst_readings
        WHERE 1=1
    """
    params = {"limit": limit, "offset": offset}

    if bbox:
        try:
            minLon, minLat, maxLon, maxLat = map(float, bbox.split(','))
            base_query += " AND ST_Within(location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))"
            params.update({"minLon": minLon, "minLat": minLat, "maxLon": maxLon, "maxLat": maxLat})
        except ValueError:
            pass

    if start_date:
        base_query += " AND recorded_at >= :start_date"
        params["start_date"] = start_date
    if end_date:
        base_query += " AND recorded_at <= :end_date"
        params["end_date"] = end_date
    if min_temp is not None:
        base_query += " AND temperature >= :min_temp"
        params["min_temp"] = min_temp
    if max_temp is not None:
        base_query += " AND temperature <= :max_temp"
        params["max_temp"] = max_temp
    if str(only_anomalies).lower() == 'true':
        base_query += " AND is_anomaly = true"

    base_query += " ORDER BY recorded_at DESC LIMIT :limit OFFSET :offset"

    result = db.session.execute(text(base_query), params).fetchall()
    return [dict(row._mapping) for row in result]

def get_anomaly_zones_geojson(severity=None, dataset_id=None):
    cache_key = f"sst:anomalies:{severity or 'all'}:{dataset_id or 'all'}"
    cached = get_cache(cache_key)
    if cached: return cached

    base_query = """
        SELECT
         id, ST_AsGeoJSON(zone) AS zone_geojson, ST_AsGeoJSON(center) AS center_geojson,
         severity, avg_temperature, max_temperature, min_temperature, anomaly_count, threshold_delta, detected_at
        FROM anomaly_zones
        WHERE is_active = true
    """
    params = {}
    if severity:
        base_query += " AND severity = :severity"
        params["severity"] = severity
    if dataset_id:
        base_query += " AND dataset_id = :dataset_id"
        params["dataset_id"] = dataset_id

    base_query += " ORDER BY detected_at DESC"
    result = db.session.execute(text(base_query), params).fetchall()

    features = []
    for row in result:
        r = dict(row._mapping)
        features.append({
            "type": "Feature",
            "geometry": json.loads(r['zone_geojson']) if r['zone_geojson'] else None,
            "properties": {
                "id": r['id'],
                "severity": r['severity'],
                "avgTemperature": r['avg_temperature'],
                "maxTemperature": r['max_temperature'],
                "minTemperature": r['min_temperature'],
                "anomalyCount": r['anomaly_count'],
                "thresholdDelta": r['threshold_delta'],
                "detectedAt": r['detected_at'].isoformat() if r['detected_at'] else None,
                "center": json.loads(r['center_geojson']) if r['center_geojson'] else None,
            }
        })

    geojson = {"type": "FeatureCollection", "features": features}
    set_cache(cache_key, geojson, 600)
    return geojson

def get_heatmap_data(dataset_id=None, grid_size=0.5):
    cache_key = f"sst:heatmap:{dataset_id or 'latest'}:{grid_size}"
    cached = get_cache(cache_key)
    if cached: return cached

    params = {"grid": grid_size}
    if dataset_id:
        dataset_condition = "WHERE dataset_id = :ds_id"
        params["ds_id"] = dataset_id
    else:
        dataset_condition = "WHERE dataset_id = (SELECT id FROM sst_datasets WHERE status = 'ready' ORDER BY ingested_at DESC LIMIT 1)"

    query = text(f"""
        SELECT
         ST_X(ST_Centroid(ST_Collect(location)))::FLOAT AS lng,
         ST_Y(ST_Centroid(ST_Collect(location)))::FLOAT AS lat,
         AVG(temperature)::FLOAT AS avg_temp,
         MAX(temperature)::FLOAT AS max_temp,
         MIN(temperature)::FLOAT AS min_temp,
         COUNT(*)::INTEGER AS point_count
        FROM sst_readings
        {dataset_condition}
        GROUP BY ST_SnapToGrid(location, :grid)
        HAVING COUNT(*) >= 1
    """)

    result = db.session.execute(query, params).fetchall()
    
    heatmap = []
    for r in result:
        avg_t = r.avg_temp
        heatmap.append({
            "lat": r.lat, "lng": r.lng, "avgTemp": avg_t, 
            "maxTemp": r.max_temp, "minTemp": r.min_temp, 
            "count": r.point_count, 
            "intensity": min(avg_t / 35.0, 1.0)
        })

    set_cache(cache_key, heatmap, 900)
    return heatmap

def get_trend(lat, lon, radius_km=50):
    query = text("""
        SELECT
         DATE_TRUNC('day', recorded_at) AS date,
         AVG(temperature)::FLOAT AS avg_temp,
         MAX(temperature)::FLOAT AS max_temp,
         MIN(temperature)::FLOAT AS min_temp,
         COUNT(*)::INTEGER AS reading_count
        FROM sst_readings
        WHERE ST_DWithin(
         location::geography,
         ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
         :radius_meters
        )
        GROUP BY DATE_TRUNC('day', recorded_at)
        ORDER BY date ASC
        LIMIT 365
    """)
    result = db.session.execute(query, {"lon": lon, "lat": lat, "radius_meters": radius_km * 1000}).fetchall()
    
    trend = []
    for r in result:
        row_dict = dict(r._mapping)
        if row_dict.get('date'):
            row_dict['date'] = row_dict['date'].isoformat()
        trend.append(row_dict)
        
    return trend

def get_datasets():
    query = text("""
        SELECT d.*, u.full_name AS uploaded_by_name
        FROM sst_datasets d
        LEFT JOIN users u ON d.uploaded_by = u.id
        ORDER BY d.ingested_at DESC
    """)
    result = db.session.execute(query).fetchall()
    
    datasets = []
    for r in result:
        d = dict(r._mapping)
        if d.get('ingested_at'): d['ingested_at'] = d['ingested_at'].isoformat()
        if d.get('date_range_start'): d['date_range_start'] = d['date_range_start'].isoformat()
        if d.get('date_range_end'): d['date_range_end'] = d['date_range_end'].isoformat()
        datasets.append(d)
        
    return datasets