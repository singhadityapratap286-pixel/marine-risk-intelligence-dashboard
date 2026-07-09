import { io } from 'socket.io-client';

// Connects to your Flask-SocketIO server!
export const socket = io('http://localhost:5000', {
    auth: {
        token: localStorage.getItem('token')
    }
});

// Listen for the global alerts we set up in Python
socket.on('alert:new', (alert) => {
    console.log('🚨 NEW MARINE ALERT:', alert);
});]
