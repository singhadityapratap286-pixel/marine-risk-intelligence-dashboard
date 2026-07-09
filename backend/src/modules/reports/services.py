from sqlalchemy import text
from src.config.database import db
from src.config.redis import delete_cache
from src.middleware.error_handler import AppError

def submit_report(reporter_id, latitude, longitude, incident_type, title, description, severity, media_urls):
    """
    Submit a new community incident report
    """
    query = text("""
        INSERT INTO community_reports
        (reporter_id, location, latitude, longitude, incident_type, title, description, severity, media_urls)
        VALUES (:reporter_id, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :lat, :lon, :type, :title, :desc, :severity, :urls)
        RETURNING id, latitude, longitude, incident_type, title, status, created_at
    """)
    
    params = {
        "reporter_id": reporter_id,
        "lat": latitude,
        "lon": longitude,
        "type": incident_type,
        "title": title,
        "desc": description,
        "severity": severity or 'medium',
        "urls": media_urls or []
    }

    result = db.session.execute(query, params).fetchone()
    db.session.commit()

    delete_cache('dashboard:summary')
    delete_cache('gis:risk_zones')
    
    return dict(result._mapping)

def get_public_reports(bbox=None, incident_type=None, start_date=None, limit=200):
    """
    List approved public reports (GeoJSON for map)
    """
    base_query = """
        SELECT
         id, latitude, longitude, incident_type, title, description,
         severity, media_urls, status, created_at
        FROM community_reports
        WHERE status = 'approved'
    """
    params = {"limit": limit}

    if bbox:
        # Split "minLon,minLat,maxLon,maxLat" into floats
        try:
            min_lon, min_lat, max_lon, max_lat = map(float, bbox.split(','))
            base_query += " AND ST_Within(location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))"
            params.update({
                "minLon": min_lon, "minLat": min_lat, 
                "maxLon": max_lon, "maxLat": max_lat
            })
        except ValueError:
            pass # Ignore invalid bbox strings

    if incident_type:
        base_query += " AND incident_type = :type"
        params["type"] = incident_type

    if start_date:
        base_query += " AND created_at >= :start_date"
        params["start_date"] = start_date

    base_query += " ORDER BY created_at DESC LIMIT :limit"

    result = db.session.execute(text(base_query), params).fetchall()

    # Format into standard GeoJSON FeatureCollection
    features = []
    for row in result:
        r = dict(row._mapping)
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point", 
                "coordinates": [r['longitude'], r['latitude']]
            },
            "properties": {
                "id": r['id'],
                "incidentType": r['incident_type'],
                "title": r['title'],
                "description": r['description'],
                "severity": r['severity'],
                "mediaUrls": r['media_urls'],
                "createdAt": r['created_at'].isoformat() if r['created_at'] else None,
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

def get_report_by_id(report_id, include_private=False):
    """
    Get single report by ID
    """
    base_query = """
        SELECT
         cr.*,
         u.full_name AS reporter_name,
         rv.full_name AS reviewer_name
        FROM community_reports cr
        LEFT JOIN users u ON cr.reporter_id = u.id
        LEFT JOIN users rv ON cr.reviewed_by = rv.id
        WHERE cr.id = :id
    """
    
    if not include_private:
        base_query += " AND cr.status = 'approved'"

    result = db.session.execute(text(base_query), {"id": report_id}).fetchone()

    if not result:
        raise AppError('Report not found.', 404)
        
    return dict(result._mapping)

def add_media_to_report(report_id, reporter_id, new_urls):
    """
    Add media URLs to a report's array
    """
    # Use array_cat or the || operator to append lists in Postgres
    query = text("""
        UPDATE community_reports
        SET media_urls = media_urls || CAST(:new_urls AS text[])
        WHERE id = :id AND reporter_id = :reporter_id
        RETURNING id, media_urls
    """)
    
    result = db.session.execute(query, {
        "new_urls": new_urls, 
        "id": report_id, 
        "reporter_id": reporter_id
    }).fetchone()
    
    db.session.commit()

    if not result:
        raise AppError('Report not found or unauthorized.', 404)
        
    return dict(result._mapping)