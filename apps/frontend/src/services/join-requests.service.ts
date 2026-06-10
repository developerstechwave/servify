import api from './api';

export const joinRequestsService = {
  async getPending(type?: string) {
    const params = type ? `?type=${type}` : '';
    const { data } = await api.get(`/join-requests${params}`);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/join-requests/${id}`);
    return data;
  },

  async approveOrganisation(id: string) {
    const { data } = await api.patch(`/join-requests/${id}/approve-organisation`);
    return data;
  },

  async reject(id: string) {
    const { data } = await api.patch(`/join-requests/${id}/reject`);
    return data;
  },
};
