import api from './api';

export const listVoiceRooms = async () => {
  const res = await api.get('/voice/rooms');
  return res.data;
};

export const createVoiceRoom = async (payload) => {
  const res = await api.post('/voice/rooms', payload);
  return res.data;
};

export const joinVoiceRoom = async (roomId) => {
  const res = await api.post(`/voice/rooms/${roomId}/join`);
  return res.data;
};

export const leaveVoiceRoom = async (roomId) => {
  const res = await api.post(`/voice/rooms/${roomId}/leave`);
  return res.data;
};

export const listVoiceParticipants = async (roomId) => {
  const res = await api.get(`/voice/rooms/${roomId}/participants`);
  return res.data;
};
