from sqlalchemy import text
from src.config.database import db
from src.middleware.error_handler import AppError

def get_admin_reports(status=None, limit=50, offset=0):
    """
    Get all reports for admin review (all statuses)
    """
    base_query = """
        SELECT
         cr.*,
         u.email AS reporter_email,
         u.full_name AS reporter_name,
         rv.full_name AS reviewer_name
        FROM community_reports cr
        LEFT JOIN users u ON cr.reporter_id = u.id
        LEFT JOIN users rv ON cr.reviewed_by = rv.id
        WHERE 1=1
    """
    count_query = "SELECT COUNT(*) FROM community_reports cr WHERE 1=1"
    
    params = {"limit": limit or 50, "offset": offset or 0}

    # Dynamically append filters
    if status:
        base_query += " AND cr.status = :status"
        count_query += " AND cr.status = :status"
        params["status"] = status

    # Add sorting and pagination to the main query
    base_query += " ORDER BY cr.created_at DESC LIMIT :limit OFFSET :offset"

    # Execute queries
    result = db.session.execute(text(base_query), params).fetchall()
    count_result = db.session.execute(text(count_query), params).scalar()

    # Convert rows to dictionaries
    reports = [dict(row._mapping) for row in result]
    
    return {"reports": reports, "total": count_result}


def review_report(report_id, admin_id, review_data):
    """
    Review a report (approve or reject)
    """
    action = review_data.get('action')
    review_notes = review_data.get('reviewNotes')

    if action not in ['approved', 'rejected', 'resolved']:
        raise AppError('Action must be approved, rejected, or resolved.', 400)

    query = text("""
        UPDATE community_reports
        SET status = :status, reviewed_by = :reviewer_id, review_notes = :notes, reviewed_at = NOW()
        WHERE id = :id
        RETURNING id, status, reviewed_at
    """)
    
    result = db.session.execute(query, {
        "status": action,
        "reviewer_id": admin_id,
        "notes": review_notes,
        "id": report_id
    }).fetchone()
    
    db.session.commit()

    if not result:
        raise AppError('Report not found.', 404)
        
    return dict(result._mapping)


def get_users(query_params):
    """
    Get all users
    """
    role = query_params.get('role')
    limit = int(query_params.get('limit', 50))

    base_query = """
        SELECT id, email, full_name, role, is_active, is_verified, last_login, created_at
        FROM users
        WHERE 1=1
    """
    params = {"limit": limit}

    if role:
        base_query += " AND role = :role"
        params["role"] = role

    base_query += " ORDER BY created_at DESC LIMIT :limit"

    result = db.session.execute(text(base_query), params).fetchall()
    return [dict(row._mapping) for row in result]


def toggle_user_status(user_id):
    """
    Toggle user active status
    """
    query = text("""
        UPDATE users 
        SET is_active = NOT is_active 
        WHERE id = :id 
        RETURNING id, email, is_active
    """)
    
    result = db.session.execute(query, {"id": user_id}).fetchone()
    db.session.commit()
    
    if not result:
        raise AppError('User not found.', 404)
        
    return dict(result._mapping)


def get_platform_stats():
    """
    Platform stats for admin dashboard
    """
    # Execute aggregate queries
    datasets = db.session.execute(text("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='ready') AS ready FROM sst_datasets")).fetchone()
    readings = db.session.execute(text("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_anomaly=true) AS anomalies FROM sst_readings")).fetchone()
    reports = db.session.execute(text("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='approved') AS approved FROM community_reports")).fetchone()
    alerts = db.session.execute(text("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active=true) AS active FROM alerts")).fetchone()
    users = db.session.execute(text("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE role='reporter') AS reporters FROM users")).fetchone()
    simulations = db.session.execute(text("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='done') AS completed FROM simulations")).fetchone()

    # Format the payload
    return {
        "datasets": dict(datasets._mapping) if datasets else {},
        "readings": dict(readings._mapping) if readings else {},
        "reports": dict(reports._mapping) if reports else {},
        "alerts": dict(alerts._mapping) if alerts else {},
        "users": dict(users._mapping) if users else {},
        "simulations": dict(simulations._mapping) if simulations else {},
    }