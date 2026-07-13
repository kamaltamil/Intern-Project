import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'kanban_user';

const loadUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // If the ID is numeric (old format), discard and clear storage to prevent API type mismatch
    if (parsed && parsed.id && !isNaN(Number(parsed.id))) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const savedUser = loadUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    isAuthenticated: !!savedUser,
  },
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
