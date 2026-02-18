import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resolvex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 + network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        localStorage.removeItem('resolvex_token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      toast.error('Connection error. Please try again.', { id: 'network-error' });
    }
    return Promise.reject(error);
  }
);

export default api;
