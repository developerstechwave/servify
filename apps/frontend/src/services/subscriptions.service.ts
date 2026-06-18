import api from './api';

export const subscriptionsService = {
  // Products
  async getProducts(search?: string) {
    const params = search ? `?search=${search}` : '';
    const { data } = await api.get(`/subscriptions/products${params}`);
    return data;
  },

  async getAllProducts() {
    const { data } = await api.get('/subscriptions/products/all');
    return data;
  },

  async createProduct(payload: {
    name: string; description?: string;
    region?: string; country?: string; vat?: string;
  }) {
    const { data } = await api.post('/subscriptions/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: any) {
    const { data } = await api.patch(`/subscriptions/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await api.delete(`/subscriptions/products/${id}`);
    return data;
  },

  // Services
  async getServices(search?: string) {
    const params = search ? `?search=${search}` : '';
    const { data } = await api.get(`/subscriptions/services${params}`);
    return data;
  },

  async createService(payload: {
    name: string; price: number; productId: string;
    vat?: string; region?: string; status?: string; expiryDate?: string;
  }) {
    const { data } = await api.post('/subscriptions/services', payload);
    return data;
  },

  async updateService(id: string, payload: any) {
    const { data } = await api.patch(`/subscriptions/services/${id}`, payload);
    return data;
  },

  async deleteService(id: string) {
    const { data } = await api.delete(`/subscriptions/services/${id}`);
    return data;
  },
};
