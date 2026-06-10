import api from './api';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async register(payload: {
    token:     string;
    fullName:  string;
    email:     string;
    password:  string;
    address1:  string;
    address2?: string;
    region:    string;
    country:   string;
    phone:     string;
  }) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
