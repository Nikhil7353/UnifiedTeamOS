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
  const response = await api.put(`/tasks/${id}/status`, { status });
  return response.data;
};