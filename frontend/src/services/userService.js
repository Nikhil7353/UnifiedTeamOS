import api from './api';

export const updateUserProfile = async (userData) => {
  const response = await api.put('/api/users/me', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};
