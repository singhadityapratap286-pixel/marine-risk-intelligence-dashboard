from flask import request, jsonify, g
from src.modules.gis import services as gis_service
from src.middleware.error_handler import AppError

def get_layers():
    """
    Fetch GIS layers.
    Supports ?type=vector
    """
    layer_type = request.args.get('type')
    layers = gis_service.get_layers(layer_type=layer_type)
    
    return jsonify({
        "success": True, 
        "count": len(layers), 
        "data": layers
    }), 200

def get_layer_by_id(layer_id):
    """
    Fetch a single GIS layer by its ID.
    """
    layer = gis_service.get_layer_by_id(layer_id)
    
    return jsonify({
        "success": True, 
        "data": layer
    }), 200

def create_layer():
    """
    Admin route to create a new custom GIS layer.
    """
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description')
    layer_type = data.get('layerType')
    geojson_data = data.get('geojsonData')
    source_url = data.get('sourceUrl')
    style_config = data.get('styleConfig')
    
    if not name or not layer_type:
        raise AppError('name and layerType are required.', 400)
        
    # Set default style if none is provided
    if not style_config:
        style_config = {'color': '#3388ff', 'weight': 2, 'opacity': 0.8}
        
    layer = gis_service.create_layer(
        name=name,
        description=description,
        layer_type=layer_type,
        geojson_data=geojson_data,
        source_url=source_url,
        style_config=style_config,
        created_by=g.user['id']
    )
    
    return jsonify({
        "success": True, 
        "message": "GIS layer created.", 
        "data": layer
    }), 201

def get_risk_zones():
    """
    Fetch aggregated risk zones based on SST anomalies and reports.
    """
    geojson = gis_service.get_risk_zones()
    return jsonify({
        "success": True, 
        "data": geojson
    }), 200

def get_coastlines():
    """
    Fetch base coastline GeoJSON data.
    """
    data = gis_service.get_coastlines()
    return jsonify({
        "success": True, 
        "data": data
    }), 200