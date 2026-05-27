import axios from 'axios';

// In development: '' so requests go through the Vite proxy (no CORS).
// In production: the full Render URL via the env variable.
const apiGatewayUrl = import.meta.env.VITE_API_URL ?? '';

const apiClient = axios.create({
  baseURL: apiGatewayUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
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

export default apiClient;
