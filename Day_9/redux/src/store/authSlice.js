import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }) => {
  const users = await API.get(`/users?email=${email}&password=${password}`);
  if (users.data.length === 0) throw new Error("Invalid credentials");
  
  const user = users.data[0];
  const token = `session_${Math.random().toString(36).substr(2, 9)}`;
  
  await API.post('/sessions', { token, userId: user.id, createdAt: new Date().toISOString() });
  localStorage.setItem('sessionToken', token);
  return { user, token };
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: !!localStorage.getItem('sessionToken') },
  reducers: {
    logout: (state) => { state.user = null; state.isAuthenticated = false; localStorage.removeItem('sessionToken'); }
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
  }
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;