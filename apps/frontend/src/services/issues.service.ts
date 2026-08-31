import api from './api';

export const issuesService = {
  async getAll(status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const { data } = await api.get(`/issues?${params.toString()}`);
    return data;
  },

  async getMyIssues() {
    const { data } = await api.get('/issues/my');
    return data;
  },

  async getAssigned(status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const { data } = await api.get(`/issues/assigned?${params.toString()}`);
    return data;
  },

  async getEmployees() {
    const { data } = await api.get('/issues/employees');
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get(`/issues/${id}`);
    return data;
  },

  async create(payload: {
    topic: string; description: string;
    serviceId?: string; serviceName?: string;
  }) {
    const { data } = await api.post('/issues', payload);
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await api.patch(`/issues/${id}`, { status });
    return data;
  },

  async assignTicket(id: string, employeeId: string) {
    const { data } = await api.patch(`/issues/${id}/assign`, { employeeId });
    return data;
  },

  async addComment(id: string, body: string) {
    const { data } = await api.post(`/issues/${id}/comments`, { body });
    return data;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/issues/${id}`);
    return data;
  }
};
