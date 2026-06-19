import api from './api';

export const customerSubscriptionsService = {
  async getAll(search?: string, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const { data } = await api.get(`/customer-subscriptions?${params.toString()}`);
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get(`/customer-subscriptions/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await api.get('/customer-subscriptions/stats');
    return data;
  },

  async create(payload: {
    productId:    string;
    productName:  string;
    serviceId:    string;
    serviceName:  string;
    description?: string;
    billingType?: string;
    expiryDate?:  string;
  }) {
    const { data } = await api.post('/customer-subscriptions', payload);
    return data;
  },

  async update(id: string, payload: any) {
    const { data } = await api.patch(`/customer-subscriptions/${id}`, payload);
    return data;
  },

  async unsubscribe(id: string) {
    const { data } = await api.patch(`/customer-subscriptions/${id}/unsubscribe`);
    return data;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/customer-subscriptions/${id}`);
    return data;
  },
};
