import axios from "axios";
import { store } from "../store/store";
import { logout, setTokens } from "../store/slices/authSlice";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

/* -------------------------------------------------------------------------- */
/*                          Auth Route Helpers                                */
/* -------------------------------------------------------------------------- */

/**
 * Routes that should NOT trigger a token refresh attempt.
 * Prevents infinite loops on auth failures.
 */
const isAuthRoute = (url = "") => {
  return [
    "/users/login",
    "/users/refresh",
    "/users/logout",
    "/users/signup",
  ].some((route) => url.includes(route));
};

/* -------------------------------------------------------------------------- */
/*                          Request Interceptor                               */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* -------------------------------------------------------------------------- */
/*                          Response Interceptor                              */
/* -------------------------------------------------------------------------- */

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const shouldRefresh =
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url) &&
      error.response?.status === 401;

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
            const response = await api.post("/users/refresh", {
              refreshToken,
            });

            const data = response.data || {};

            /*
             * Store the new tokens AND updated role/permissions
             * so RBAC stays in sync after silent token rotation.
             */
            store.dispatch(
              setTokens({
                token: data.token,
                refreshToken: data.refreshToken,
                role: data.role,
                permissions: data.permissions,
              })
            );

            return data.token;
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
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
