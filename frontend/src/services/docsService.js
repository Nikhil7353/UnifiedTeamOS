import api from './api';

export const listDocuments = async () => {
  const res = await api.get('/docs');
  return res.data;
};

export const createDocument = async (payload) => {
  const res = await api.post('/docs', payload);
  return res.data;
};

export const getDocument = async (docId) => {
  const res = await api.get(`/docs/${docId}`);
  return res.data;
};

export const updateDocument = async (docId, payload) => {
  const res = await api.put(`/docs/${docId}`, payload);
  return res.data;
};

export const deleteDocument = async (docId) => {
  const res = await api.delete(`/docs/${docId}`);
  return res.data;
};

export const listDocumentComments = async (docId) => {
  const res = await api.get(`/docs/${docId}/comments`);
  return res.data;
};

export const addDocumentComment = async (docId, payload) => {
  const res = await api.post(`/docs/${docId}/comments`, payload);
  return res.data;
};
