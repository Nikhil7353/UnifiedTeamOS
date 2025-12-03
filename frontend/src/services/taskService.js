import api from './api';

export const getAllTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (task) => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  // We send the status as a raw string, so we set Content-Type to text
  const response = await api.put(`/tasks/${id}/status`, status, {
    headers: { 'Content-Type': 'text/plain' }
  });
  return response.data;
};