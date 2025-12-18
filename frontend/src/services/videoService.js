import api from './api';

export const listVideoCalls = async () => {
  const res = await api.get('/video/calls');
  return res.data;
};

export const createVideoCall = async (payload) => {
  const res = await api.post('/video/calls', payload);
  return res.data;
};

export const joinVideoCall = async (callId, payload) => {
  const res = await api.post(`/video/calls/${callId}/join`, payload);
  return res.data;
};

export const leaveVideoCall = async (callId) => {
  const res = await api.post(`/video/calls/${callId}/leave`);
  return res.data;
};

export const listVideoParticipants = async (callId) => {
  const res = await api.get(`/video/calls/${callId}/participants`);
  return res.data;
};
