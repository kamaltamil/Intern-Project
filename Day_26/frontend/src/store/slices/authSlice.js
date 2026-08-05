import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  role: 'Member',
  theme: 'light',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setAuth: (state, action) => {
      const payload = action.payload || {};
      state.user = payload.user || null;
      state.token = payload.token || null;
      state.refreshToken = payload.refreshToken || null;
      const rawRole = payload.user?.role || 'Member';
      state.role = typeof rawRole === 'string'
        ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
        : 'Member';
      state.loading = false;
      state.error = null;
    },

    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (action.payload?.role) {
          const rawRole = action.payload.role;
          state.role = typeof rawRole === 'string'
            ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
            : state.role;
        }
      }
    },

    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      const currentTheme = state.theme; // preserve theme across logout
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = 'Member';
      state.loading = false;
      state.error = null;
      state.theme = currentTheme;
    },
    setTokens: (state, action) => {
      const { token, refreshToken } = action.payload || {};
      state.token = token || null;
      state.refreshToken = refreshToken || null;
    }
  },
});

export const {
  startLoading,
  setAuth,
  updateUserProfile,
  setTheme,
  setError,
  logout,
  setTokens,
} = authSlice.actions;

export default authSlice.reducer;
