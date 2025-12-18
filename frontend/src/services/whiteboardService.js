import api from './api';

export const listBoards = async () => {
  const res = await api.get('/whiteboard/boards');
  return res.data;
};

export const createBoard = async (payload) => {
  const res = await api.post('/whiteboard/boards', payload);
  return res.data;
};

export const listStrokes = async (boardId) => {
  const res = await api.get(`/whiteboard/boards/${boardId}/strokes`);
  return res.data;
};

export const addStroke = async (boardId, payload) => {
  const res = await api.post(`/whiteboard/boards/${boardId}/strokes`, payload);
  return res.data;
};
