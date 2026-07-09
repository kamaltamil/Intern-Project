import { create } from 'zustand';
import API from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('sessionToken'),
  loading: false,
  error: null,
  login: async ({ email, password }) => {           // fixed: destructure the object
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/users?email=${email}&password=${password}`);
      if (response.data && response.data.length > 0) {
        const user = response.data[0];
        const token = `session_${Math.random().toString(36).substr(2, 9)}`;
        await API.post('/sessions', { token, userId: user.id, createdAt: new Date().toISOString() });
        localStorage.setItem('sessionToken', token);
        set({ isAuthenticated: true, user, loading: false });
      } else {
        set({ error: 'Invalid email or password', loading: false });
      }
    } catch (error) {
      set({ error: 'Server error, please try again.', loading: false });
    }
  },
  restoreSession: async () => {                      // new: fixes the refresh bug
    const token = localStorage.getItem('sessionToken');
    if (!token) return false;
    try {
      const sessionRes = await API.get(`/sessions?token=${token}`);
      if (sessionRes.data.length === 0) {
        localStorage.removeItem('sessionToken');
        set({ isAuthenticated: false, user: null });
        return false;
      }
      const { userId } = sessionRes.data[0];
      const userRes = await API.get(`/users/${userId}`);
      set({ isAuthenticated: true, user: userRes.data });
      return true;
    } catch {
      set({ isAuthenticated: false, user: null });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem('sessionToken');
    set({ isAuthenticated: false, user: null });
  }
}));