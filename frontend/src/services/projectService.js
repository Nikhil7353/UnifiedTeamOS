import api from './api';

export const listProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const createProject = async (project) => {
  const response = await api.post('/projects', project);
  return response.data;
};

export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId, project) => {
  const response = await api.put(`/projects/${projectId}`, project);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const listProjectCards = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/cards`);
  return response.data;
};

export const createProjectCard = async (projectId, card) => {
  const response = await api.post(`/projects/${projectId}/cards`, card);
  return response.data;
};

export const updateProjectCard = async (cardId, card) => {
  const response = await api.put(`/projects/cards/${cardId}`, card);
  return response.data;
};

export const deleteProjectCard = async (cardId) => {
  const response = await api.delete(`/projects/cards/${cardId}`);
  return response.data;
};
