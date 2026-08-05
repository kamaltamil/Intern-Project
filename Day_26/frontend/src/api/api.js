import axios from 'axios';
import { store } from '../store/store';
import { logout, setTokens } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: process.env.BASE_URL || 'http://localhost:8000/api/v1',
});

const isAuthRoute = (url = '') => {
  return [
    '/users/login',
    '/users/refresh-token',
    '/users/logout',
  ].some((route) => url.includes(route));
};

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url) &&
      (error.response?.status === 401 || error.response?.status === 403);

    if (shouldRefresh) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          const { refreshToken } = store.getState().auth;

          if (!refreshToken) {
            store.dispatch(logout());
            return null;
          }

          try {
            const response = await api.post('/users/refresh-token', { refreshToken });
            const data = response.data || {};

            store.dispatch(
              setTokens({
                token: data.token,
                refreshToken: data.refreshToken,
              })
            );

            return data.token;
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            store.dispatch(logout());
            return null;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise;

      if (!newToken) {
        throw error;
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }

    throw error;
  }
);

export default api;
