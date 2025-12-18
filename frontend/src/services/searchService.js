import api from './api';

export const unifiedSearch = async (q) => {
  const res = await api.get(`/search?q=${encodeURIComponent(q || '')}`);
  return res.data;
};
