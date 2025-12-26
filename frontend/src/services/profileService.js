import api from './api';

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/profile/upload-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getProfilePictureUrl = (userId) => {
  return `/api/profile/picture/${userId}`;
};

export const deleteProfilePicture = async () => {
  const response = await api.delete('/api/profile/picture');
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await api.get('/api/profile/me');
  return response.data;
};
