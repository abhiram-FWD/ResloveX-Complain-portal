import api from './api';

const dashboardService = {
  getPublicStats: async () => {
    const response = await api.get('/authority/dashboard/public');
    return response.data;
  },
};

export default dashboardService;
