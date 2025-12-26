import api from './api';

export const getProfile = async () => {
  const response = await api.get('/settings/profile');
  return response.data;
};

export const updateProfile = async (profile) => {
  const response = await api.put('/settings/profile', profile);
  return response.data;
};

export const getNotificationSettings = async () => {
  const response = await api.get('/settings/notifications');
  return response.data;
};

export const updateNotificationSettings = async (settings) => {
  const response = await api.put('/settings/notifications', settings);
  return response.data;
};

export const getUserPreferences = async () => {
  const response = await api.get('/settings/preferences');
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await api.put('/settings/preferences', preferences);
  return response.data;
};

export const getSecuritySettings = async () => {
  const response = await api.get('/settings/security');
  return response.data;
};

export const enableTwoFactor = async () => {
  const response = await api.post('/settings/security/enable-2fa');
  return response.data;
};

export const disableTwoFactor = async () => {
  const response = await api.post('/settings/security/disable-2fa');
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/settings/security/change-password', passwordData);
  return response.data;
};

export const getApiKeys = async () => {
  const response = await api.get('/settings/api-keys');
  return response.data;
};

export const createApiKey = async (keyData) => {
  const response = await api.post('/settings/api-keys', keyData);
  return response.data;
};
