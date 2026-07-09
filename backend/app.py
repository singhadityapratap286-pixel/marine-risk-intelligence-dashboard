import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_swagger_ui import get_swaggerui_blueprint # <-- Added Swagger Import

# --- 1. Import Configurations & Globals ---
from src.config.env import env
from src.config.database import db, test_connection
from src.config.redis import redis # Importing this triggers the connection test
from src.config.storage import init_bucket

# --- 2. Import Middleware & Sockets ---
from src.middleware.error_handler import register_error_handlers
from src.middleware.rate_limiter import limiter
from src.sockets.events import register_socket_events

# --- 3. Import Blueprints (Modules) ---
from src.modules.auth.routes import auth_bp
from src.modules.admin.routes import admin_bp
from src.modules.alerts.routes import alerts_bp
from src.modules.dashboard.routes import dashboard_bp
from src.modules.gis.routes import gis_bp
from src.modules.reports.routes import reports_bp
from src.modules.simulation.routes import simulation_bp
from src.modules.sst.routes import sst_bp

# --- 4. Import Background Jobs ---
from src.jobs.noaa_ingestion import start_noaa_ingestion_job

def create_app():
    """Application Factory Pattern"""
    app = Flask(__name__)

    # --- App Configuration ---
    app.config['SECRET_KEY'] = env['jwt']['secret']
    
    # Construct the SQLAlchemy Database URI securely from env.py
    db_cfg = env['db']
    db_url = f"postgresql://{db_cfg['user']}:{db_cfg['password']}@{db_cfg['host']}:{db_cfg['port']}/{db_cfg['name']}"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Initialize Extensions ---
    # CORS allows your React/Frontend app to talk to this API
    CORS(app, resources={r"/api/*": {"origins": env['server']['frontend_url']}})
    
    # Bind Database and Rate Limiter to this app
    db.init_app(app)
    limiter.init_app(app)
    
    # Initialize Socket.IO for real-time broadcasts
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    # Attach socketio to the app extensions so our controllers can access it!
    app.extensions['socketio'] = socketio
    
    # Register all our real-time listeners!
    register_socket_events(socketio)

    # --- Register Global Error Handlers ---
    register_error_handlers(app)

    # --- Register Blueprints (The API Endpoints) ---
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(gis_bp, url_prefix='/api/gis')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(simulation_bp, url_prefix='/api/simulation')
    app.register_blueprint(sst_bp, url_prefix='/api/sst')

    # --- Swagger UI Documentation ---
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.yaml'
    
    swaggerui_bp = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Marine Risk Intelligence API"
        }
    )
    app.register_blueprint(swaggerui_bp, url_prefix=SWAGGER_URL)

    # --- Basic Health Check Route ---
    @app.route('/health')
    def health_check():
        return jsonify({
            "status": "healthy", 
            "message": "Marine Risk Intelligence API is running!"
        }), 200

    return app, socketio


# --- Bootstrapping the Application ---
app, socketio = create_app()

if __name__ == '__main__':
    # When the server starts, run these setup tasks inside the app context
    with app.app_context():
        # 1. Test database connection
        test_connection()
        
        # 2. Ensure database tables exist (if you haven't created them manually)
        # db.create_all() 
        
        # 3. Initialize MinIO Storage Bucket
        init_bucket()
        
        # 4. Start Background Jobs
        start_noaa_ingestion_job(app)

    # Start the server using SocketIO (which wraps around Flask to allow WebSockets)
    print(f"🚀 Server starting on port {env['server']['port']} in {env['server']['env']} mode...")
    socketio.run(
        app, 
        host='0.0.0.0', 
        port=env['server']['port'], 
        debug=(env['server']['env'] == 'development'),
        allow_unsafe_werkzeug=True  # <-- This fixes the Werkzeug crash!
    )