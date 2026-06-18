import api from './api';

export const rolesService = {
  async getAll(search?: string) {
    const params = search ? `?search=${search}` : '';
    const { data } = await api.get(`/roles${params}`);
    return data;
  },

  async create(roles: string[]) {
    const { data } = await api.post('/roles', { roles });
    return data;
  },

  async update(id: string, name: string) {
    const { data } = await api.patch(`/roles/${id}`, { name });
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  },
};
