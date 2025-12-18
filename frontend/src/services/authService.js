import api from './api';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);

    // Store the JWT token and user data
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('currentUser');
  return !!(token && user);
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('darkMode');
};