import math
from datetime import datetime, timezone

STANDARD_OCEAN_TEMP = 26.0
COLD_THRESHOLD = 20.0
HOT_THRESHOLD = 32.0

def hsl_to_hex(h, s, l):
    """Convert HSL values to HEX color string"""
    s /= 100.0
    l /= 100.0
    a = s * min(l, 1 - l)
    
    def f(n):
        k = (n + h / 30.0) % 12.0
        color = l - a * max(min(k - 3.0, 9.0 - k, 1.0), -1.0)
        return f"{round(255.0 * color):02x}"
        
    return f"#{f(0)}{f(8)}{f(4)}"

def temperature_to_color(temp):
    """Map a temperature to a HEX color using smooth HSL interpolation."""
    clamped = max(10.0, min(40.0, temp))

    if clamped <= STANDARD_OCEAN_TEMP:
        ratio = (clamped - 10.0) / (STANDARD_OCEAN_TEMP - 10.0)
        h = 240.0 - (ratio * 60.0)
        s = 85.0 + (ratio * 10.0)
        l = 40.0 + (ratio * 15.0)
    else:
        ratio = (clamped - STANDARD_OCEAN_TEMP) / (40.0 - STANDARD_OCEAN_TEMP)
        h = 180.0 - (ratio * 180.0)
        s = 95.0 - (ratio * 10.0)
        l = 55.0 - (ratio * 20.0)

    return hsl_to_hex(round(h), round(s), round(l))

def temperature_to_opacity(temp):
    """Get color opacity based on temperature intensity"""
    deviation = abs(temp - STANDARD_OCEAN_TEMP)
    return min(0.25 + (deviation / 10.0) * 0.55, 0.85)

def generate_circle_ring(center_lon, center_lat, radius_km, sides=64):
    """Generate a circle polygon around a center."""
    coords = []
    earth_radius_km = 6371.0
    lat_rad = math.radians(center_lat)

    for i in range(sides + 1):
        angle = (i / sides) * 2.0 * math.pi
        dlat = (radius_km / earth_radius_km) * math.cos(angle) * (180.0 / math.pi)
        dlon = (radius_km / earth_radius_km) * math.sin(angle) / math.cos(lat_rad) * (180.0 / math.pi)
        coords.append([center_lon + dlon, center_lat + dlat])

    return coords

def generate_annulus_polygon(center_lon, center_lat, inner_radius_km, outer_radius_km, sides=64):
    """Generate an annular ring (donut polygon) between two radii."""
    outer_ring = generate_circle_ring(center_lon, center_lat, outer_radius_km, sides)
    inner_ring = generate_circle_ring(center_lon, center_lat, inner_radius_km, sides)
    inner_ring.reverse()

    return {
        "type": "Polygon",
        "coordinates": [outer_ring, inner_ring]
    }

def gaussian_decay(epicenter_temp, distance_km, decay_rate=0.025):
    """Gaussian decay function for temperature spread"""
    temp_deviation = epicenter_temp - STANDARD_OCEAN_TEMP
    decayed_deviation = temp_deviation * math.exp(-decay_rate * math.pow(distance_km, 1.5))
    return STANDARD_OCEAN_TEMP + decayed_deviation

def run_thermal_plume(params):
    """Run the standard thermal plume simulation."""
    epicenter_lon = params.get('epicenterLon')
    epicenter_lat = params.get('epicenterLat')
    epicenter_temp = params.get('epicenterTemp')
    max_radius_km = params.get('maxRadiusKm', 200)
    num_rings = params.get('numRings', 10)
    decay_rate = params.get('decayRate', 0.025)
    model_type = params.get('modelType', 'thermal_plume')

    features = []
    ring_step = max_radius_km / num_rings
    color_map = []

    for i in range(num_rings):
        inner_radius = 0 if i == 0 else i * ring_step
        outer_radius = (i + 1) * ring_step
        mid_radius = (inner_radius + outer_radius) / 2.0

        temp = gaussian_decay(epicenter_temp, mid_radius, decay_rate)
        color = temperature_to_color(temp)
        opacity = temperature_to_opacity(temp)

        if i == 0:
            coords = generate_circle_ring(epicenter_lon, epicenter_lat, outer_radius)
            geometry = {"type": "Polygon", "coordinates": [coords]}
        else:
            geometry = generate_annulus_polygon(epicenter_lon, epicenter_lat, inner_radius, outer_radius)

        deviation = temp - STANDARD_OCEAN_TEMP
        
        if abs(deviation) >= 6: severity = 'critical'
        elif abs(deviation) >= 4: severity = 'high'
        elif abs(deviation) >= 2: severity = 'medium'
        else: severity = 'low'

        features.append({
            "type": "Feature",
            "id": i + 1,
            "geometry": geometry,
            "properties": {
                "ringIndex": i + 1,
                "innerRadiusKm": round(inner_radius),
                "outerRadiusKm": round(outer_radius),
                "midRadiusKm": round(mid_radius),
                "temperature": round(temp, 2),
                "temperatureDeviation": round(deviation, 2),
                "color": color,
                "opacity": opacity,
                "severity": severity,
                "isAboveStandard": temp > STANDARD_OCEAN_TEMP,
                "isBelowStandard": temp < STANDARD_OCEAN_TEMP,
            }
        })

        color_map.append({"temp": round(temp, 1), "color": color, "opacity": opacity, "ringIndex": i + 1})

    features.insert(0, {
        "type": "Feature",
        "id": 0,
        "geometry": {"type": "Point", "coordinates": [epicenter_lon, epicenter_lat]},
        "properties": {
            "type": "epicenter",
            "temperature": epicenter_temp,
            "color": temperature_to_color(epicenter_temp),
            "severity": 'critical' if abs(epicenter_temp - STANDARD_OCEAN_TEMP) >= 6 else 'high',
            "label": f"{epicenter_temp}°C — Anomaly Epicenter"
        }
    })

    legend_scale = []
    for t in range(10, 41, 2):
        legend_scale.append({
            "temp": float(t),
            "color": temperature_to_color(float(t)),
            "label": f"{t}°C",
            "isStandard": float(t) == STANDARD_OCEAN_TEMP
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "modelType": model_type,
            "epicenter": {"lon": epicenter_lon, "lat": epicenter_lat},
            "epicenterTemp": epicenter_temp,
            "standardOceanTemp": STANDARD_OCEAN_TEMP,
            "maxRadiusKm": max_radius_km,
            "numRings": num_rings,
            "colorMap": color_map,
            "legendScale": legend_scale,
            "generatedAt": datetime.now(timezone.utc).isoformat()
        }
    }

def run_heatwave_spread(params):
    """Run a heatwave spread simulation (elliptical based on wind)"""
    epicenter_lon = params.get('epicenterLon')
    epicenter_lat = params.get('epicenterLat')
    epicenter_temp = params.get('epicenterTemp')
    max_radius_km = params.get('maxRadiusKm', 300)
    wind_direction_deg = params.get('windDirectionDeg', 0)
    wind_speed_factor = params.get('windSpeedFactor', 1.5)
    num_rings = params.get('numRings', 12)
    decay_rate = params.get('decayRate', 0.020)

    features = []
    ring_step = max_radius_km / num_rings
    color_map = []
    wind_rad = math.radians(wind_direction_deg)
    earth_radius_km = 6371.0
    lat_rad = math.radians(epicenter_lat)
    sides = 64

    for i in range(num_rings):
        inner_radius = 0 if i == 0 else i * ring_step
        outer_radius = (i + 1) * ring_step
        mid_radius = (inner_radius + outer_radius) / 2.0
        
        temp = gaussian_decay(epicenter_temp, mid_radius, decay_rate)
        color = temperature_to_color(temp)
        opacity = temperature_to_opacity(temp)

        coords = []
        for j in range(sides + 1):
            angle = (j / sides) * 2.0 * math.pi
            elongation_factor = 1.0 + (wind_speed_factor - 1.0) * math.pow(math.cos(angle - wind_rad), 2)
            r = outer_radius * elongation_factor
            dlat = (r / earth_radius_km) * math.cos(angle) * (180.0 / math.pi)
            dlon = (r / earth_radius_km) * math.sin(angle) / math.cos(lat_rad) * (180.0 / math.pi)
            coords.append([epicenter_lon + dlon, epicenter_lat + dlat])

        if i == 0:
            geometry = {"type": "Polygon", "coordinates": [coords]}
        else:
            inner_coords = []
            for j in range(sides, -1, -1):
                angle = (j / sides) * 2.0 * math.pi
                elongation_factor = 1.0 + (wind_speed_factor - 1.0) * math.pow(math.cos(angle - wind_rad), 2)
                r = inner_radius * elongation_factor
                dlat = (r / earth_radius_km) * math.cos(angle) * (180.0 / math.pi)
                dlon = (r / earth_radius_km) * math.sin(angle) / math.cos(lat_rad) * (180.0 / math.pi)
                inner_coords.append([epicenter_lon + dlon, epicenter_lat + dlat])
            geometry = {"type": "Polygon", "coordinates": [coords, inner_coords]}

        deviation = temp - STANDARD_OCEAN_TEMP
        if abs(deviation) >= 6: severity = 'critical'
        elif abs(deviation) >= 4: severity = 'high'
        elif abs(deviation) >= 2: severity = 'medium'
        else: severity = 'low'

        features.append({
            "type": "Feature",
            "id": i + 1,
            "geometry": geometry,
            "properties": {
                "ringIndex": i + 1,
                "temperature": round(temp, 2),
                "temperatureDeviation": round(deviation, 2),
                "color": color,
                "opacity": opacity,
                "severity": severity,
                "windDirectionDeg": wind_direction_deg,
                "windSpeedFactor": wind_speed_factor
            }
        })
        color_map.append({"temp": round(temp, 1), "color": color, "opacity": opacity})

    features.insert(0, {
        "type": "Feature",
        "id": 0,
        "geometry": {"type": "Point", "coordinates": [epicenter_lon, epicenter_lat]},
        "properties": {
            "type": "epicenter", 
            "temperature": epicenter_temp, 
            "color": temperature_to_color(epicenter_temp), 
            "label": f"{epicenter_temp}°C"
        }
    })

    legend_scale = []
    for t in range(10, 41, 2):
        legend_scale.append({"temp": float(t), "color": temperature_to_color(float(t)), "label": f"{t}°C", "isStandard": float(t) == STANDARD_OCEAN_TEMP})

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "modelType": 'heatwave_spread',
            "epicenter": {"lon": epicenter_lon, "lat": epicenter_lat},
            "epicenterTemp": epicenter_temp,
            "windDirectionDeg": wind_direction_deg,
            "windSpeedFactor": wind_speed_factor,
            "maxRadiusKm": max_radius_km,
            "colorMap": color_map,
            "legendScale": legend_scale,
            "generatedAt": datetime.now(timezone.utc).isoformat()
        }
    }