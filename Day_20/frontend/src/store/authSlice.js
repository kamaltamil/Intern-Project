import { createSlice } from "@reduxjs/toolkit";

export const normalizeUserData = (userData) => {
  if (!userData) return null;

  if (userData.success && userData.data) {
    if (userData.data?.user) {
      return userData.data.user;
    }

    return userData.data;
  }

  if (userData.user && (userData.user.name || userData.user.email || userData.user._id)) {
    return userData.user;
  }

  if (userData.name || userData.email || userData._id) {
    return userData;
  }

  return userData;
};

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const authData = action.payload;
      const payload = authData?.data || authData;
      const normalizedUser = normalizeUserData(authData?.user ? authData : payload);
      const authToken = payload?.token || authData?.token || null;
      const refreshToken = payload?.refreshToken || authData?.refreshToken || null;

      state.user = normalizedUser;
      state.token = authToken;
      state.refreshToken = refreshToken;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
    setNewToken: (state, action) => {
      const newToken = action.payload;
      state.token = newToken;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, setNewToken, setUser } = authSlice.actions;
export default authSlice.reducer;
