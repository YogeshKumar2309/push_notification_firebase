import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Notification APIs
export const saveFCMToken = async (token, deviceInfo) => {
  const response = await api.post('/notifications/save-token', { token, deviceInfo });
  return response.data;
};

export const sendTestNotification = async () => {
  const response = await api.post('/notifications/send');
  return response.data;
};

export const getUserDevices = async () => {
  const response = await api.get('/notifications/devices');
  return response.data;
};

export default api;