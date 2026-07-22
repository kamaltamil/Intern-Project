import axios from "axios";
import { store } from "../store";
import { logout, setNewToken } from "../store/authSlice";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
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
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL || "http://localhost:8080/api"}/auth/refresh`,
              { refreshToken }
            );

            const payload = response.data?.data || response.data;
            const newToken = payload?.token || response.data?.token;
            if (newToken) {
              store.dispatch(setNewToken(newToken));
              return newToken;
            }
          } catch (e) {
            // If the refresh token request fails, clean up and redirect
          }

          store.dispatch(logout());
          window.location.href = "/login";
          return null;
        })();
      }

      try {
        const newToken = await refreshPromise;
        if (!newToken) {
          return Promise.reject(error);
        }

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