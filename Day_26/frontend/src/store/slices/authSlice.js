import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,

  // JWT access token
  token: null,

  // JWT refresh token
  refreshToken: null,

  // User role name string (e.g. "Admin", "Manager", "Member")
  role: null,

  // RBAC permissions array from backend
  // [{ resource: "users", action: { view, create, update, delete } }]
  permissions: [],

  // UI theme
  theme: "light",

  loading: false,

  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /**
     * Start authentication/loading state
     */
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    /**
     * Store complete authentication information after login.
     *
     * Expected payload:
     * {
     *   user,
     *   token,
     *   refreshToken,
     *   role,
     *   permissions
     * }
     */
    setAuth: (state, action) => {
      const {
        user,
        token,
        refreshToken,
        role,
        permissions,
      } = action.payload;

      state.user = user || null;
      state.token = token || null;
      state.refreshToken = refreshToken || null;

      // Prefer role from payload; fall back to user object role
      state.role = role || user?.role || null;

      // Store permissions returned by backend
      state.permissions = Array.isArray(permissions) ? permissions : [];

      state.loading = false;
      state.error = null;
    },

    /**
     * Update only the tokens (used by the axios refresh interceptor).
     *
     * Also updates role and permissions if the refresh endpoint returns them.
     *
     * Expected payload:
     * {
     *   token,
     *   refreshToken,
     *   role?,
     *   permissions?
     * }
     */
    setTokens: (state, action) => {
      const { token, refreshToken, role, permissions } = action.payload;

      if (token) state.token = token;
      if (refreshToken) state.refreshToken = refreshToken;
      if (role) state.role = role;

      if (Array.isArray(permissions)) {
        state.permissions = permissions;
      }
    },

    /**
     * Update only the logged-in user's profile fields.
     */
    updateUserProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };

      if (action.payload?.role) {
        state.role = typeof action.payload.role === 'object' ? action.payload.role.name : action.payload.role;
      }

      if (Array.isArray(action.payload?.permissions)) {
        state.permissions = action.payload.permissions;
      }
    },

    /**
     * Update role and permissions separately.
     *
     * Useful after a token refresh or when Admin changes a role's permissions.
     */
    setRolePermissions: (state, action) => {
      const { role, permissions } = action.payload;

      if (role) state.role = role;

      if (Array.isArray(permissions)) {
        state.permissions = permissions;
      }
    },

    /**
     * Update UI theme
     */
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    /**
     * Set authentication error
     */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Logout — clears all auth state
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.permissions = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  startLoading,
  setAuth,
  setTokens,
  updateUserProfile,
  setRolePermissions,
  setTheme,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;