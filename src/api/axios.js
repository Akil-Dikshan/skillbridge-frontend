import axios from 'axios';

const apiGatewayUrl = 'https://api-gateway-wxe8.onrender.com';

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
