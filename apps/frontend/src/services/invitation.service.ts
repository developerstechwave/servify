import api from './api';

export const invitationService = {
  async validateToken(token: string) {
    const { data } = await api.get(`/auth/validate-token/${token}`);
    return data;
  },
};
