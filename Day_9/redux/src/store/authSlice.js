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

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('sessionToken');
  if (!token) return rejectWithValue('No session');

  try {
    const sessionRes = await API.get(`/sessions?token=${token}`);
    if (sessionRes.data.length === 0) {
      localStorage.removeItem('sessionToken');
      return rejectWithValue('Session expired');
    }
    const { userId } = sessionRes.data[0];
    const userRes = await API.get(`/users/${userId}`);
    return { user: userRes.data, token };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem('sessionToken'),
    initializing: !!localStorage.getItem('sessionToken'), // only true if we need to verify a token
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('sessionToken');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.initializing = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.initializing = false;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;