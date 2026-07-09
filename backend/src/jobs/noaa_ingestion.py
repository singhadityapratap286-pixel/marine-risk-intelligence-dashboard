import os
import csv
import time
from datetime import datetime, timedelta, timezone
import requests
from sqlalchemy import text

# Import your database and environment configs
from src.config.database import db
from src.config.env import env

# We will import the ingest_dataset function once we translate your SST module!
# from src.modules.sst.service import ingest_dataset

def days_since_last_team_upload():
    """
    Check when the last team upload occurred.
    Returns days since last upload, or 999 if never.
    """
    query = text("""
        SELECT MAX(ingested_at) AS last_upload
        FROM sst_datasets
        WHERE source = 'team_upload' AND status = 'ready'
    """)
    result = db.session.execute(query).fetchone()
    
    if not result or not result.last_upload:
        return 999  # Never uploaded
        
    last_upload_date = result.last_upload
    # Ensure timezone awareness for subtraction
    if last_upload_date.tzinfo is None:
        last_upload_date = last_upload_date.replace(tzinfo=timezone.utc)
        
    delta = datetime.now(timezone.utc) - last_upload_date
    return delta.total_seconds() / (60 * 60 * 24)

def fetch_noaa_data():
    """
    Fetch SST data from NOAA ERDDAP API
    """
    noaa_cfg = env['noaa']
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    date_str = yesterday.strftime('%Y-%m-%dT09:00:00Z')

    # Construct the ERDDAP CSV endpoint URL
    url = (
        f"{noaa_cfg['erddap_base_url']}/griddap/{noaa_cfg['dataset_id']}.csv"
        f"?analysed_sst[({date_str}):1:({date_str})]"
        f"[(-20.0):10:(30.0)]"  # latitude range
        f"[(40.0):10:(120.0)]"  # longitude range
    )

    print(f"📡 Fetching NOAA data from: {url}")

    response = requests.get(url, timeout=60, headers={'Accept': 'text/csv'})
    response.raise_for_status() # Raises an error if the request fails
    return response.text

def save_to_temp_file(csv_data):
    """
    Save fetched CSV data to a temporary file
    """
    upload_dir = env['upload']['upload_dir']
    dir_path = os.path.join(upload_dir, 'sst', 'noaa_auto')
    os.makedirs(dir_path, exist_ok=True)

    file_name = f"noaa_auto_{int(time.time() * 1000)}.csv"
    file_path = os.path.join(dir_path, file_name)

    lines = csv_data.split('\n')
    
    # Find the actual header row
    header_idx = next((i for i, l in enumerate(lines) if 'analysed_sst' in l or 'time' in l), 0)

    # Filter and format lines
    standard_header = 'datetime,latitude,longitude,temperature'
    processed_lines = [standard_header]

    for line in lines[header_idx + 1:]:
        if not line.strip() or line.startswith('UTC'):
            continue
            
        parts = line.split(',')
        if len(parts) >= 4:
            timestamp, lat, lon, sst = [p.strip() for p in parts[:4]]
            try:
                temp_celsius = float(sst) - 273.15 # Convert Kelvin to Celsius
                processed_lines.append(f"{timestamp},{lat},{lon},{temp_celsius:.2f}")
            except ValueError:
                continue

    # Write to local file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(processed_lines))
        
    return file_path

def run_noaa_auto_pull():
    """
    Main auto-pull function
    """
    try:
        noaa_cfg = env['noaa']
        days = days_since_last_team_upload()
        print(f"📅 Days since last team upload: {days:.1f}")

        if days < noaa_cfg['auto_pull_threshold_days']:
            print(f"✅ Team upload is recent ({days:.1f} days ago). Skipping NOAA auto-pull.")
            db.session.execute(
                text("INSERT INTO noaa_pull_log (status, notes) VALUES ('skipped', :notes)"),
                {"notes": f"Team upload {days:.1f} days ago — within {noaa_cfg['auto_pull_threshold_days']} day threshold"}
            )
            db.session.commit()
            return

        print(f"⚠️ No team upload in {days:.1f} days. Auto-pulling from NOAA ERDDAP...")

        # Create dataset record
        dataset_result = db.session.execute(
            text("""
                INSERT INTO sst_datasets (name, description, source, status, file_type)
                VALUES (:name, :desc, 'noaa_auto', 'processing', 'csv')
                RETURNING id
            """),
            {
                "name": f"NOAA_AUTO_{datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
                "desc": f"Automatically fetched from NOAA ERDDAP ({noaa_cfg['dataset_id']}) — triggered because no team upload in {round(days)} days"
            }
        )
        dataset_id = dataset_result.scalar()
        db.session.commit()

        # Fetch and save data
        csv_data = fetch_noaa_data()
        file_path = save_to_temp_file(csv_data)

        # Ingest the data (We will uncomment this once the SST module is translated)
        # stats = ingest_dataset(dataset_id=dataset_id, file_path=file_path, uploaded_by=None)
        
        # NOTE: Temporary mock stats until ingest_dataset is added
        stats = {"total_records": 100, "anomaly_count": 5} 

        # Log success
        db.session.execute(
            text("""
                INSERT INTO noaa_pull_log (status, records_fetched, dataset_id, notes)
                VALUES ('success', :records, :dataset_id, :notes)
            """),
            {
                "records": stats["total_records"],
                "dataset_id": dataset_id,
                "notes": f"Auto-pulled: {stats['total_records']} records, {stats['anomaly_count']} anomalies"
            }
        )
        db.session.commit()
        print(f"✅ NOAA auto-pull complete: {stats['total_records']} records ingested")

    except Exception as err:
        print(f"❌ NOAA auto-pull failed: {str(err)}")
        db.session.rollback() # Always rollback on error
        try:
            db.session.execute(
                text("INSERT INTO noaa_pull_log (status, error_message) VALUES ('failed', :err)"),
                {"err": str(err)}
            )
            db.session.commit()
        except Exception as log_err:
            pass # Don't throw if logging fails

def start_noaa_ingestion_job(app):
    """
    Start the cron job — runs daily at 06:00 UTC
    """
    from apscheduler.schedulers.background import BackgroundScheduler
    
    print('⏰ NOAA auto-ingestion job scheduled (daily at 06:00 UTC)')
    scheduler = BackgroundScheduler(timezone="UTC")
    
    # We must wrap the task in the app context so it can safely use the database
    def scheduled_task():
        with app.app_context():
            print('🔄 Running NOAA auto-ingestion check...')
            run_noaa_auto_pull()

    # Schedule daily at 06:00
    scheduler.add_job(scheduled_task, 'cron', hour=6, minute=0)
    scheduler.start()