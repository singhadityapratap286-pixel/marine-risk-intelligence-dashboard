import csv
import json
import math
import os
from datetime import datetime, timezone
from dateutil import parser as date_parser

def compute_stats(records):
    """Compute basic statistics for a set of temperature records"""
    if not records:
        return None
        
    temps = sorted([r['temperature'] for r in records])
    count = len(temps)
    mean = sum(temps) / count
    variance = sum((t - mean) ** 2 for t in temps) / count
    
    return {
        "count": count,
        "min": temps[0],
        "max": temps[-1],
        "mean": round(mean, 2),
        "median": temps[count // 2],
        "stdDev": round(math.sqrt(variance), 2),
        "p95": temps[int(count * 0.95)] if count > 0 else temps[-1]
    }

def detect_anomalies(records, threshold=2.0):
    """Detect anomalies using z-score method"""
    stats = compute_stats(records)
    if not stats:
        return records

    processed_records = []
    for r in records:
        z_score = (r['temperature'] - stats['mean']) / stats['stdDev'] if stats['stdDev'] > 0 else 0
        r['anomalyScore'] = abs(z_score)
        r['isAnomaly'] = abs(z_score) > threshold
        processed_records.append(r)
        
    return processed_records

def parse_csv(file_path):
    """Parse a CSV file into an array of SST records"""
    records = []
    error_count = 0
    row_count = 0

    with open(file_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        
        # Normalize column names to lowercase and strip whitespace
        reader.fieldnames = [name.strip().lower() for name in (reader.fieldnames or [])]

        for row in reader:
            row_count += 1
            try:
                # Extract and normalize fields
                lat = float(row.get('latitude') or row.get('lat') or row.get('y', 'NaN'))
                lon = float(row.get('longitude') or row.get('lon') or row.get('long') or row.get('x', 'NaN'))
                temp = float(row.get('temperature') or row.get('temp') or row.get('sst') or row.get('sea_surface_temperature', 'NaN'))
                
                date_str = row.get('date') or row.get('datetime') or row.get('time') or row.get('timestamp') or row.get('recorded_at')
                depth = float(row.get('depth') or row.get('depth_m') or 0.0)
                quality_flag = int(row.get('quality_flag') or row.get('quality') or row.get('qflag') or 0)

                # Validations
                if math.isnan(lat) or math.isnan(lon) or math.isnan(temp):
                    error_count += 1
                    continue
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    error_count += 1
                    continue
                if not (-5 <= temp <= 45):
                    error_count += 1
                    continue

                recorded_at = date_parser.parse(date_str) if date_str else datetime.now(timezone.utc)

                records.append({
                    "lat": lat,
                    "lon": lon,
                    "temperature": round(temp, 2),
                    "recordedAt": recorded_at.isoformat(),
                    "depth": depth,
                    "qualityFlag": quality_flag
                })
            except Exception:
                error_count += 1

    print(f"CSV parsed: {len(records)} valid records, {error_count} skipped out of {row_count} rows")
    return records

def parse_json(file_path):
    """Parse a JSON / GeoJSON file into SST records"""
    records = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Handle GeoJSON FeatureCollection
    if isinstance(data, dict) and data.get('type') == 'FeatureCollection':
        for feature in data.get('features', []):
            geom = feature.get('geometry', {})
            props = feature.get('properties', {})
            
            if geom.get('type') != 'Point':
                continue
                
            lon, lat = geom.get('coordinates', [None, None])
            temp = props.get('temperature') or props.get('temp') or props.get('sst')
            
            try:
                lat, lon, temp = float(lat), float(lon), float(temp)
                date_str = props.get('date') or props.get('datetime') or props.get('recorded_at')
                recorded_at = date_parser.parse(date_str).isoformat() if date_str else datetime.now(timezone.utc).isoformat()
                
                records.append({
                    "lat": lat, "lon": lon, "temperature": round(temp, 2),
                    "recordedAt": recorded_at,
                    "depth": float(props.get('depth') or 0),
                    "qualityFlag": int(props.get('quality_flag') or 0)
                })
            except (TypeError, ValueError):
                continue

    # Handle plain JSON array
    elif isinstance(data, list):
        for item in data:
            try:
                lat = float(item.get('lat') or item.get('latitude'))
                lon = float(item.get('lon') or item.get('longitude'))
                temp = float(item.get('temperature') or item.get('temp') or item.get('sst'))
                
                date_str = item.get('date')
                recorded_at = date_parser.parse(date_str).isoformat() if date_str else datetime.now(timezone.utc).isoformat()
                
                records.append({
                    "lat": lat, "lon": lon, "temperature": round(temp, 2),
                    "recordedAt": recorded_at,
                    "depth": float(item.get('depth') or 0),
                    "qualityFlag": int(item.get('quality_flag') or 0)
                })
            except (TypeError, ValueError):
                continue

    print(f"JSON parsed: {len(records)} valid records")
    return records

def parse_file(file_path):
    """Auto-detect file type and parse accordingly"""
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.csv', '.txt']:
        return parse_csv(file_path)
    if ext in ['.json', '.geojson']:
        return parse_json(file_path)
    raise ValueError(f"Unsupported file type: {ext}. Use .csv, .json, or .geojson")