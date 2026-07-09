import axios from 'axios';

// Connects to your Flask backend!
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Automatically attaches your JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;