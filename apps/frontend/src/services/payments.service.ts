import api from './api';

export const paymentsService = {
  async getAll(status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const { data } = await api.get(`/payments?${params.toString()}`);
    return data;
  },

  async getMyPayments() {
    const { data } = await api.get('/payments/my');
    return data;
  },

  async getStats() {
    const { data } = await api.get('/payments/stats');
    return data;
  },

  async create(payload: {
    serviceId:   string;
    serviceName: string;
    productName: string;
    amount:      number;
    vat?:        string;
    expiryDate?: string;
  }) {
    const { data } = await api.post('/payments', payload);
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await api.patch(`/payments/${id}/status`, { status });
    return data;
  },
};
