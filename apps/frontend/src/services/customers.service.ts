import api from './api';

export const customersService = {
  async getAll(search?: string, filter?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    const { data } = await api.get(`/customers?${params.toString()}`);
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  async invite(name: string, email: string, phone?: string) {
    const { data } = await api.post('/customers/invite', { name, email, phone });
    return data;
  },

  async reinvite(id: string) {
    const { data } = await api.post(`/customers/${id}/reinvite`);
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },
};
