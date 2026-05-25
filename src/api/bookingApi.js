import apiClient from './axios';

export const createBooking = async (bookingData) => {
  const response = await apiClient.post('/api/bookings', bookingData);
  return response.data;
};

export const getStudentBookings = async (studentId) => {
  const response = await apiClient.get(`/api/bookings/student/${studentId}`);
  return response.data;
};

export const getMentorBookings = async (mentorId) => {
  const response = await apiClient.get(`/api/bookings/mentor/${mentorId}`);
  return response.data;
};

export const acceptBooking = async (bookingId) => {
  const response = await apiClient.put(`/api/bookings/${bookingId}/accept`);
  return response.data;
};

export const rejectBooking = async (bookingId) => {
  const response = await apiClient.put(`/api/bookings/${bookingId}/reject`);
  return response.data;
};

export const cancelBooking = async (bookingId, reason) => {
  const response = await apiClient.put(`/api/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

export const completeSession = async (bookingId) => {
  const response = await apiClient.put(`/api/bookings/${bookingId}/complete`);
  return response.data;
};
