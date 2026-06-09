import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async me(token: string) {
    const { data } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
