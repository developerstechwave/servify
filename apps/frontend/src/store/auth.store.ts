import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organisationId: string | null;
  avatar?: string | null;
  phone?: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;

  setAuth: (token: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,

  setAuth: (token, user) => {
    set({
      accessToken: token,
      user,
    });
  },

  setAccessToken: (token) => {
    set({
      accessToken: token,
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
    });
  },

  isAuthenticated: () => {
    return !!get().accessToken;
  },
}));
