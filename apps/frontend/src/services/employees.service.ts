import api from './api';

export const employeesService = {
  async getAll(search?: string, filter?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    const { data } = await api.get(`/employees?${params.toString()}`);
    return data;
  },

  async create(employees: {
    fullName: string; email: string;
    phone?: string; role?: string;
    region?: string; country?: string;
  }[]) {
    const { data } = await api.post('/employees', { employees });
    return data;
  },

  async update(id: string, payload: {
    fullName?: string; email?: string;
    phone?: string; role?: string;
    region?: string; country?: string;
  }) {
    const { data } = await api.patch(`/employees/${id}`, payload);
    return data;
  },

  async deactivate(id: string) {
    const { data } = await api.patch(`/employees/${id}/deactivate`);
    return data;
  },

  async activate(id: string) {
    const { data } = await api.patch(`/employees/${id}/activate`);
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
  },
};
