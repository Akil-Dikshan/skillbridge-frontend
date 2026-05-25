import apiClient from './axios';

export const createReview = async (reviewData) => {
  const response = await apiClient.post('/api/reviews', reviewData);
  return response.data;
};

export const getMentorReviews = async (mentorId) => {
  const response = await apiClient.get(`/api/reviews/mentor/${mentorId}`);
  return response.data;
};

export const getMentorAverageRating = async (mentorId) => {
  const response = await apiClient.get(`/api/reviews/mentor/${mentorId}/average`);
  return response.data;
};
