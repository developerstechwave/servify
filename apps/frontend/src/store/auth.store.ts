import { create } from 'zustand';

interface AuthUser {
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
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const COOKIE_NAME = 'servify_token';
const USER_COOKIE = 'servify_user';

function setCookie(name: string, value: string, minutes: number) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

function getInitialState(): { accessToken: string | null; user: AuthUser | null } {
  try {
    const token = getCookie(COOKIE_NAME);
    const userRaw = getCookie(USER_COOKIE);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { accessToken: token, user };
  } catch {
    return { accessToken: null, user: null };
  }
}

const initial = getInitialState();

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: initial.accessToken,
  user:        initial.user,

  setAuth: (token, user) => {
    setCookie(COOKIE_NAME, token, 14);
    setCookie(USER_COOKIE, JSON.stringify(user), 14);
    set({ accessToken: token, user });
  },

  clearAuth: () => {
    deleteCookie(COOKIE_NAME);
    deleteCookie(USER_COOKIE);
    set({ accessToken: null, user: null });
  },

  isAuthenticated: () => !!get().accessToken,
}));
