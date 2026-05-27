import apiClient from './axios';

export const createBooking = async (bookingData) => {
  const response = await apiClient.post('/api/bookings', bookingData);
  return response.data;
};

export const getStudentBookings = async () => {
  const response = await apiClient.get('/api/bookings/student');
  return response.data;
};

export const getMentorBookings = async () => {
  const response = await apiClient.get('/api/bookings/mentor');
  return response.data;
};

export const acceptBooking = async (bookingId) => {
  const response = await apiClient.patch(`/api/bookings/${bookingId}/status?status=CONFIRMED`);
  return response.data;
};

export const rejectBooking = async (bookingId) => {
  const response = await apiClient.patch(`/api/bookings/${bookingId}/status?status=CANCELLED`);
  return response.data;
};

export const cancelBooking = async (bookingId, reason) => {
  const response = await apiClient.patch(`/api/bookings/${bookingId}/status?status=CANCELLED`);
  return response.data;
};

export const completeSession = async (bookingId) => {
  const response = await apiClient.patch(`/api/bookings/${bookingId}/status?status=COMPLETED`);
  return response.data;
};
