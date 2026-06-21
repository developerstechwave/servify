import api from './api';

export const notificationsService = {
  async getAll(type?: string, unreadOnly?: boolean) {
    const params = new URLSearchParams();
    if (type)       params.append('type', type);
    if (unreadOnly) params.append('unreadOnly', 'true');
    const { data } = await api.get(`/notifications?${params.toString()}`);
    return data;
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },

  async markAsRead(id: string) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  async markAllAsRead() {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },
};
