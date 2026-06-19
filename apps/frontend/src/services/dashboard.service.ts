import api from './api';

export const dashboardService = {
  async getSuperAdminStats() {
    const { data } = await api.get('/dashboard/super-admin');
    return data;
  },

  async getAdminStats() {
    const { data } = await api.get('/dashboard/admin');
    return data;
  },

  async getEmployeeStats() {
    const { data } = await api.get('/dashboard/employee');
    return data;
  },
};
