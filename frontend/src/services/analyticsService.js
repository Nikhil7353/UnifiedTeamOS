import api from './api';

export const getOverviewStats = async () => {
  const res = await api.get('/analytics/overview');
  return res.data;
};

export const getUsageAnalytics = async (range = '7d', segment = 'all') => {
  const res = await api.get(`/analytics/usage?range=${range}&segment=${segment}`);
  return res.data;
};
