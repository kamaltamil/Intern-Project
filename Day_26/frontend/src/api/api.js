import axios from "axios";
import { store } from "../store/store";
import { logout, setTokens } from "../store/slices/authSlice";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

/* -------------------------------------------------------------------------- */
/*                              Auth Helpers                                  */
/* -------------------------------------------------------------------------- */

const getAuthState = () => {
  const state = store.getState();

  return state?.auth || {
    token: null,
    refreshToken: null,
  };
};

const isAuthRoute = (url = "") => {
  return [
    "/users/login",
    "/users/refresh",
    "/users/logout",
    "/users/signup",
  ].some((route) => url.includes(route));
};

/* -------------------------------------------------------------------------- */
/*                         Request Interceptor                                */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use(
  (config) => {
    const { token } = getAuthState();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------------------------- */
/*                         Refresh Management                                 */
/* -------------------------------------------------------------------------- */

let isRefreshing = false;
let refreshPromise = null;

const refreshAccessToken = async () => {
  const { refreshToken } = getAuthState();

  if (!refreshToken) {
    store.dispatch(logout());
    return null;
  }

  try {
    const response = await api.post("/users/refresh", {
      refreshToken,
    });

    const data = response?.data || {};

    if (!data.token) {
      store.dispatch(logout());
      return null;
    }

    store.dispatch(
      setTokens({
        token: data.token,
        refreshToken: data.refreshToken || refreshToken,
        role: data.role,
        permissions: data.permissions || [],
      })
    );

    return data.token;
  } catch (error) {
    console.error("Token refresh failed:", error);

    store.dispatch(logout());

    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                         Response Interceptor                               */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error?.config;

    if (!originalRequest) {
      throw error;
    }

    const shouldRefresh =
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url) &&
      error?.response?.status === 401;

    if (!shouldRefresh) {
      throw error;
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      throw error;
    }

    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    return api.request(originalRequest);
  }
);

export default api;