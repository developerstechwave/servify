import api from './api';

export const joinService = {
  async getOrganisations() {
    const { data } = await api.get('/join-requests/organisations');
    return data;
  },

  async customerJoinRequest(payload: {
    name:           string;
    email:          string;
    phone:          string;
    organisationId: string;
  }) {
    const { data } = await api.post('/join-requests/customer', payload);
    return data;
  },

  async organisationJoinRequest(payload: {
    companyName:          string;
    email:                string;
    phone:                string;
    businessCertificate?: string;
    description?:         string;
  }) {
    const { data } = await api.post('/join-requests/organisation', payload);
    return data;
  },
};
