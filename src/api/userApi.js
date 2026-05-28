import apiClient from './axios';

export const getMentors = async (skill = '') => {
  const url = skill ? `/api/mentors/search?skill=${encodeURIComponent(skill)}` : '/api/mentors/search?skill=';
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

export const getMentorAvailability = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/availability`);
  return response.data;
};

export const createMentorProfile = async (userId, profileData) => {
  const response = await apiClient.post(`/api/users/${userId}/mentor-profile`, profileData);
  return response.data;
};

export const addAvailabilitySlot = async (userId, slotData) => {
  const response = await apiClient.post(`/api/users/${userId}/availability`, slotData);
  return response.data;
};

export const addWorkExperience = async (userId, data) => {
  const response = await apiClient.post(`/api/users/${userId}/work-experience`, data);
  return response.data;
};

export const getWorkExperience = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/work-experience`);
  return response.data;
};

export const deleteWorkExperience = async (userId, entryId) => {
  await apiClient.delete(`/api/users/${userId}/work-experience/${entryId}`);
};

export const addEducation = async (userId, data) => {
  const response = await apiClient.post(`/api/users/${userId}/education`, data);
  return response.data;
};

export const getEducation = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}/education`);
  return response.data;
};

export const deleteEducation = async (userId, entryId) => {
  await apiClient.delete(`/api/users/${userId}/education/${entryId}`);
};

export const updateProfile = async (userId, data) => {
  const response = await apiClient.put(`/api/users/${userId}/profile`, data);
  return response.data;
};

export const updateMentorProfile = async (userId, data) => {
  const response = await apiClient.put(`/api/users/${userId}/mentor-profile`, data);
  return response.data;
};

export const deleteAvailability = async (userId, slotId) => {
  await apiClient.delete(`/api/users/${userId}/availability/${slotId}`);
};
