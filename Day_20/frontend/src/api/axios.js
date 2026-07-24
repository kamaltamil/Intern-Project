import axios from "axios";
import { store } from "../store";
import { logout, setNewToken } from "../store/authSlice";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — attaches the Authorization header automatically.
 *
 * Previously every API function called getAuthHeaders() and passed it manually.
 * Centralizing it here means the API layer functions stay clean and consistent,
 * and there is a single place to change the auth strategy.
 */
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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          const refreshToken = store.getState().auth.refreshToken;

          if (!refreshToken) {
            store.dispatch(logout());
            window.location.href = "/login";
            return null;
          }

          try {
            // Use the configured api instance (not raw axios) so the base URL
            // is not duplicated and any future request interceptors also apply.
            const response = await api.post("/auth/refresh", { refreshToken });

            const payload = response.data?.data || response.data;
            const newToken = payload?.token || response.data?.token;

            if (newToken) {
              store.dispatch(setNewToken(newToken));
              return newToken;
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError.message);
          }

          store.dispatch(logout());
          window.location.href = "/login";
          return null;
        })();
      }

      try {
        const newToken = await refreshPromise;
        if (!newToken) return Promise.reject(error);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default api;