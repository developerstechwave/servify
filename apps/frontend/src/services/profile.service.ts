import api from './api';

export const profileService = {
  async getProfile() {
    const { data } = await api.get('/profile');
    return data;
  },

  async updateProfile(payload: {
    firstName?:   string;
    lastName?:    string;
    email?:       string;
    phone?:       string;
    country?:     string;
    region?:      string;
    address?:     string;
    description?: string;
  }) {
    const { data } = await api.patch('/profile', payload);
    return data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.patch('/profile/password', { currentPassword, newPassword });
    return data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.patch('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async removeAvatar() {
    const { data } = await api.patch('/profile/remove-avatar');
    return data;
  },
};
