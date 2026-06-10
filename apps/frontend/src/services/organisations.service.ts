import api from './api';

export const organisationsService = {
  async getAll(search?: string, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const { data } = await api.get(`/organisations?${params.toString()}`);
    return data;
  },

  async invite(companyName: string, email: string, phone?: string) {
    const { data } = await api.post('/organisations/invite', { companyName, email, phone });
    return data;
  },

  async activate(organisationId: string) {
    const { data } = await api.patch(`/organisations/${organisationId}/activate`);
    return data;
  },

  async deactivate(organisationId: string) {
    const { data } = await api.patch(`/organisations/${organisationId}/deactivate`);
    return data;
  },

  async delete(organisationId: string) {
    const { data } = await api.delete(`/organisations/${organisationId}`);
    return data;
  },
};
