from flask_socketio import join_room
from flask import request
import jwt
from datetime import datetime, timezone
from src.config.env import env

def register_socket_events(socketio):
    """
    Attach event listeners to the global Socket.IO instance
    """

    @socketio.on('connect')
    def handle_connect():
        # Authenticate socket connections via JWT
        token = None
        auth = request.args.get('token')
        
        if auth:
            token = auth
        elif 'Authorization' in request.headers:
            token = request.headers.get('Authorization').replace('Bearer ', '')

        user_id = None
        user_role = None

        if token:
            try:
                decoded = jwt.decode(token, env['jwt']['secret'], algorithms=["HS256"])
                user_id = decoded.get('userId')
                user_role = decoded.get('role')
                
                # Join role-based rooms
                if user_role == 'admin':
                    join_room('admin')
                    
            except Exception:
                pass # Allow guest connection

        join_room('public') # Everyone joins public room
        
        log_msg = f"🔌 Socket connected: {request.sid}"
        if user_id:
            log_msg += f" (user: {user_id})"
        else:
            log_msg += " (guest)"
        print(log_msg)

    @socketio.on('disconnect')
    def handle_disconnect():
        print(f"🔌 Socket disconnected: {request.sid}")

    @socketio.on('subscribe:alerts')
    def handle_subscribe_alerts(data):
        severity = data.get('severity')
        if severity:
            join_room(f"alerts:{severity}")

    @socketio.on('subscribe:simulation')
    def handle_subscribe_simulation(data):
        simulation_id = data.get('simulationId')
        if simulation_id:
            join_room(f"simulation:{simulation_id}")

    @socketio.on('ping')
    def handle_ping():
        # Respond back to the client who sent the ping
        socketio.emit('pong', {'timestamp': datetime.now(timezone.utc).isoformat()}, to=request.sid)

    print('✅ Socket.IO initialized')