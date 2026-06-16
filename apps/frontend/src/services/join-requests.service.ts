import api from './api';

export const joinRequestsService = {
  async getPendingOrganisations() {
    const { data } = await api.get('/join-requests/pending/organisations');
    return data;
  },

  async getPendingCustomers() {
    const { data } = await api.get('/join-requests/pending/customers');
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

  async approveCustomer(id: string) {
    const { data } = await api.patch(`/join-requests/${id}/approve-customer`);
    return data;
  },

  async reject(id: string) {
    const { data } = await api.patch(`/join-requests/${id}/reject`);
    return data;
  },
};
