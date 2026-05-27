import apiClient from './axios';

export const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (email, password, role) => {
  const response = await apiClient.post('/api/auth/register', { email, password, role });
  return response.data;
};

