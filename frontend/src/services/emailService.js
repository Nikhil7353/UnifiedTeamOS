import api from './api';

export const listEmailAccounts = async () => {
  const res = await api.get('/email/accounts');
  return res.data;
};

export const createEmailAccount = async (payload) => {
  const res = await api.post('/email/accounts', payload);
  return res.data;
};

export const testEmailAccount = async (accountId) => {
  const res = await api.post(`/email/accounts/${accountId}/test`);
  return res.data;
};

export const syncEmailAccount = async (accountId, limit = 25) => {
  const res = await api.post(`/email/accounts/${accountId}/sync?limit=${limit}`);
  return res.data;
};

export const listEmailThreads = async (accountId) => {
  const res = await api.get(`/email/accounts/${accountId}/threads`);
  return res.data;
};

export const listEmailThreadsPaged = async (accountId, skip = 0, limit = 50) => {
  const res = await api.get(`/email/accounts/${accountId}/threads/paged?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const listThreadMessages = async (threadId) => {
  const res = await api.get(`/email/threads/${threadId}/messages`);
  return res.data;
};

export const listThreadMessagesPaged = async (threadId, skip = 0, limit = 100) => {
  const res = await api.get(`/email/threads/${threadId}/messages/paged?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const markEmailMessageRead = async (messageId, isRead = true) => {
  const res = await api.put(`/email/messages/${messageId}/read`, { is_read: isRead });
  return res.data;
};

export const sendEmail = async (accountId, payload) => {
  const res = await api.post(`/email/accounts/${accountId}/send`, payload);
  return res.data;
};

export const deleteEmailAccount = async (accountId) => {
  const res = await api.delete(`/email/accounts/${accountId}`);
  return res.data;
};
