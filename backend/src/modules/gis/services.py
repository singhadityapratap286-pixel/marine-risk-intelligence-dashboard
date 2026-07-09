import json
from sqlalchemy import text
from src.config.database import db
from src.config.redis import set_cache, get_cache, delete_cache
from src.middleware.error_handler import AppError

def get_layers(layer_type=None, is_public=True):
    """
    Get all active GIS layers
    """
    cache_key = f"gis:layers:{layer_type or 'all'}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    base_query = """
        SELECT id, name, description, layer_type, style_config, is_active, is_public, created_at
        FROM gis_layers
        WHERE is_active = true
    """
    params = {}

    if layer_type:
        base_query += " AND layer_type = :layer_type"
        params["layer_type"] = layer_type
    if is_public:
        base_query += " AND is_public = true"

    base_query += " ORDER BY layer_type, name"

    result = db.session.execute(text(base_query), params).fetchall()
    layers = [dict(row._mapping) for row in result]

    set_cache(cache_key, layers, 1800) # 30 min cache
    return layers

def get_layer_by_id(layer_id):
    """
    Get a specific GIS layer with its GeoJSON data
    """
    cache_key = f"gis:layer:{layer_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    result = db.session.execute(
        text("SELECT * FROM gis_layers WHERE id = :id AND is_active = true"),
        {"id": layer_id}
    ).fetchone()

    if not result:
        raise AppError('GIS layer not found.', 404)

    layer = dict(result._mapping)
    set_cache(cache_key, layer, 1800)
    return layer

def create_layer(name, description, layer_type, geojson_data, source_url, style_config, created_by):
    """
    Create/register a new GIS layer
    """
    query = text("""
        INSERT INTO gis_layers (name, description, layer_type, geojson_data, source_url, style_config, created_by)
        VALUES (:name, :desc, :type, :geojson, :url, :style, :created_by)
        RETURNING *
    """)
    
    params = {
        "name": name,
        "desc": description,
        "type": layer_type,
        "geojson": json.dumps(geojson_data) if geojson_data else None,
        "url": source_url,
        "style": json.dumps(style_config) if style_config else None,
        "created_by": created_by
    }

    result = db.session.execute(query, params).fetchone()
    db.session.commit()

    delete_cache('gis:layers:all')
    delete_cache(f"gis:layers:{layer_type}")
    
    return dict(result._mapping)

def get_risk_zones():
    """
    Get computed risk zones — combines anomaly zones + report density
    Returns a GeoJSON FeatureCollection of risk areas
    """
    cache_key = 'gis:risk_zones'
    cached = get_cache(cache_key)
    if cached:
        return cached

    query = text("""
        WITH anomaly_risk AS (
            SELECT
                ST_AsGeoJSON(zone)::json AS geometry,
                'anomaly' AS source,
                severity,
                avg_temperature AS intensity_value,
                detected_at AS event_time,
                anomaly_count AS event_count
            FROM anomaly_zones
            WHERE is_active = true
        ),
        report_clusters AS (
            SELECT
                ST_AsGeoJSON(ST_Buffer(ST_Centroid(ST_Collect(location))::geography, 50000)::geometry)::json AS geometry,
                'community_report' AS source,
                CASE
                    WHEN COUNT(*) >= 10 THEN 'critical'
                    WHEN COUNT(*) >= 5 THEN 'high'
                    WHEN COUNT(*) >= 3 THEN 'medium'
                    ELSE 'low'
                END AS severity,
                COUNT(*)::FLOAT AS intensity_value,
                MAX(created_at) AS event_time,
                COUNT(*)::INTEGER AS event_count
            FROM community_reports
            WHERE status = 'approved'
            GROUP BY ST_SnapToGrid(location, 1.0)
            HAVING COUNT(*) >= 2
        )
        SELECT * FROM anomaly_risk
        UNION ALL
        SELECT * FROM report_clusters
        ORDER BY event_time DESC
    """)

    result = db.session.execute(query).fetchall()

    features = []
    for i, row in enumerate(result):
        row_dict = dict(row._mapping)
        
        # Depending on the DB driver, geometry might come back as a dict or a string.
        # We ensure it's a dict for the final GeoJSON payload.
        geom = row_dict.get('geometry')
        if isinstance(geom, str):
            geom = json.loads(geom)
            
        event_time = row_dict.get('event_time')
        
        features.append({
            "type": "Feature",
            "id": i,
            "geometry": geom,
            "properties": {
                "source": row_dict.get('source'),
                "severity": row_dict.get('severity'),
                "intensityValue": row_dict.get('intensity_value'),
                "eventTime": event_time.isoformat() if event_time else None,
                "eventCount": row_dict.get('event_count')
            }
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    set_cache(cache_key, geojson, 600)
    return geojson

def get_coastlines():
    """
    Get coastline data (static — cached aggressively)
    """
    cache_key = 'gis:coastlines'
    cached = get_cache(cache_key)
    if cached:
        return cached

    query = text("""
        SELECT id, name, geojson_data, style_config
        FROM gis_layers
        WHERE layer_type = 'coastline' AND is_active = true
    """)
    
    result = db.session.execute(query).fetchall()
    data = [dict(row._mapping) for row in result]
    
    set_cache(cache_key, data, 86400) # 24 hr cache for static coastlines
    return data