import apiClient from './axios';

export const getMentors = async (skill = '') => {
  const url = skill ? `/api/users/mentors?skill=${encodeURIComponent(skill)}` : '/api/users/mentors';
  const response = await apiClient.get(url);
  return response.data;
};

export const getMentorProfile = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/mentor-profile`);
  return response.data;
};

export const createProfile = async (userId, profileData, role) => {
  const response = await apiClient.post(`/api/users/${userId}/profile?role=${role}`, profileData);
  return response.data;
};

export const getProfile = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/profile`);
  return response.data;
};
