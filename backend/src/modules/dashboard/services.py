from datetime import datetime, timezone
from sqlalchemy import text
from src.config.database import db
from src.config.redis import get_cache, set_cache

def get_summary():
    """
    Dashboard summary statistics (cached for 2 minutes)
    """
    cache_key = 'dashboard:summary'
    cached = get_cache(cache_key)
    if cached:
        return cached

    # Run the queries sequentially (PostgreSQL handles these in milliseconds)
    alert_stats = db.session.execute(text("""
        SELECT
         COUNT(*) FILTER (WHERE is_active = true)::INTEGER AS active_alerts,
         COUNT(*) FILTER (WHERE severity = 'critical' AND is_active = true)::INTEGER AS critical_alerts,
         COUNT(*) FILTER (WHERE severity = 'high' AND is_active = true)::INTEGER AS high_alerts
        FROM alerts
    """)).fetchone()

    report_stats = db.session.execute(text("""
        SELECT
         COUNT(*)::INTEGER AS total_reports,
         COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending_reports,
         COUNT(*) FILTER (WHERE status = 'approved')::INTEGER AS approved_reports,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::INTEGER AS reports_this_week
        FROM community_reports
    """)).fetchone()

    sst_stats = db.session.execute(text("""
        SELECT
         COUNT(*)::INTEGER AS total_datasets,
         SUM(total_readings)::INTEGER AS total_readings,
         MAX(ingested_at) AS last_ingested,
         COUNT(*) FILTER (WHERE status = 'ready')::INTEGER AS ready_datasets
        FROM sst_datasets
    """)).fetchone()

    trend_data = db.session.execute(text("""
        SELECT
         COUNT(*) FILTER (WHERE is_anomaly = true)::INTEGER AS total_anomalies,
         AVG(temperature)::FLOAT AS global_avg_temp,
         MAX(temperature)::FLOAT AS global_max_temp,
         MIN(temperature)::FLOAT AS global_min_temp
        FROM sst_readings
        WHERE recorded_at >= NOW() - INTERVAL '30 days'
    """)).fetchone()

    # Format the SST dict to safely handle the datetime object
    sst_dict = dict(sst_stats._mapping) if sst_stats else {}
    if sst_dict.get('last_ingested'):
        sst_dict['last_ingested'] = sst_dict['last_ingested'].isoformat()

    summary = {
        "alerts": dict(alert_stats._mapping) if alert_stats else {},
        "reports": dict(report_stats._mapping) if report_stats else {},
        "sst": sst_dict,
        "recentTrend": dict(trend_data._mapping) if trend_data else {},
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }

    set_cache(cache_key, summary, 120) # 2 min cache
    return summary

def get_timeline(days=30):
    """
    Timeline data for charts (cached for 5 minutes)
    """
    cache_key = f"dashboard:timeline:{days}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    # We safely inject the days as a string to cast to a Postgres INTERVAL
    interval_str = f"{days} days"

    query = text("""
        SELECT
         DATE_TRUNC('day', recorded_at) AS date,
         AVG(temperature)::FLOAT AS avg_temp,
         MAX(temperature)::FLOAT AS max_temp,
         MIN(temperature)::FLOAT AS min_temp,
         COUNT(*) FILTER (WHERE is_anomaly = true)::INTEGER AS anomaly_count
        FROM sst_readings
        WHERE recorded_at >= NOW() - CAST(:interval AS INTERVAL)
        GROUP BY DATE_TRUNC('day', recorded_at)
        ORDER BY date ASC
    """)

    result = db.session.execute(query, {"interval": interval_str}).fetchall()

    timeline = []
    for row in result:
        row_dict = dict(row._mapping)
        if row_dict.get('date'):
            row_dict['date'] = row_dict['date'].isoformat()
        timeline.append(row_dict)

    set_cache(cache_key, timeline, 300)
    return timeline

def get_impact():
    """
    Impact summary data (cached for 5 minutes)
    """
    cache_key = 'dashboard:impact'
    cached = get_cache(cache_key)
    if cached:
        return cached

    critical_zones = db.session.execute(text("""
        SELECT severity, COUNT(*)::INTEGER AS count
        FROM anomaly_zones
        WHERE is_active = true
        GROUP BY severity
        ORDER BY
         CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END
    """)).fetchall()

    reports_by_type = db.session.execute(text("""
        SELECT incident_type, COUNT(*)::INTEGER AS count
        FROM community_reports
        WHERE status = 'approved'
        GROUP BY incident_type
        ORDER BY count DESC
    """)).fetchall()

    alerts_by_type = db.session.execute(text("""
        SELECT alert_type, severity, COUNT(*)::INTEGER AS count
        FROM alerts
        WHERE triggered_at >= NOW() - INTERVAL '30 days'
        GROUP BY alert_type, severity
        ORDER BY count DESC
    """)).fetchall()

    weekly_trend = db.session.execute(text("""
        SELECT
         DATE_TRUNC('week', created_at) AS week,
         COUNT(*)::INTEGER AS report_count
        FROM community_reports
        WHERE created_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY week
        ORDER BY week ASC
    """)).fetchall()

    formatted_weekly_trend = []
    for row in weekly_trend:
        row_dict = dict(row._mapping)
        if row_dict.get('week'):
            row_dict['week'] = row_dict['week'].isoformat()
        formatted_weekly_trend.append(row_dict)

    impact = {
        "criticalZones": [dict(row._mapping) for row in critical_zones],
        "reportsByIncidentType": [dict(row._mapping) for row in reports_by_type],
        "recentAlertsByType": [dict(row._mapping) for row in alerts_by_type],
        "weeklyReportTrend": formatted_weekly_trend,
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }

    set_cache(cache_key, impact, 300)
    return impact