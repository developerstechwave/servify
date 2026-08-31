import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { useAuthStore } from '../store/auth.store';

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prevent multiple refresh requests at the same time.
let refreshPromise: Promise<string> | null = null;


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Refresh the access token.
 *
 * If several requests receive 401 at the same time, they all share
 * the same refresh request instead of creating multiple refresh calls.
 */
async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        '/api/auth/refresh',
        {},
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const newAccessToken = response.data.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh');
        }

        useAuthStore.getState().setAccessToken(newAccessToken);

        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Response interceptor
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /**
     * Only handle 401 responses.
     */
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }


    if (originalRequest._retry) {
      return Promise.reject(error);
    }


    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/auth/login';

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers ?? {};

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {

      useAuthStore.getState().clearAuth();

      window.location.href = '/auth/login';

      return Promise.reject(refreshError);
    }
  },
);

export default api;
