import api from './api';

export const listInboxItems = async ({ source = 'all', q = '', unread = false, skip = 0, limit = 50 } = {}) => {
  const res = await api.get('/inbox', {
    params: { source, q, unread, skip, limit },
  });
  return res.data;
};

export const setInboxItemPinned = async (source, sourceId, pinned) => {
  const res = await api.put(`/inbox/${source}/${sourceId}/pin`, { pinned: Boolean(pinned) });
  return res.data;
};

export const setInboxItemRead = async (source, sourceId, isRead) => {
  const res = await api.put(`/inbox/${source}/${sourceId}/read`, { is_read: Boolean(isRead) });
  return res.data;
};

export const markAllInboxRead = async ({ source = 'all' } = {}) => {
  const res = await api.put('/inbox/read/all', null, { params: { source } });
  return res.data;
};
