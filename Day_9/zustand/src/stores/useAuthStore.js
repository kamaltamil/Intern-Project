import { create } from 'zustand';
import API from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('sessionToken'),
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/users?email=${email}&password=${password}`);
      
      if (response.data && response.data.length > 0) {
        const user = response.data[0];
        const token = `session_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save session
        await API.post('/sessions', { token, userId: user.id, createdAt: new Date().toISOString() });
        localStorage.setItem('sessionToken', token);
        set({ isAuthenticated: true, user, loading: false });
      } else {
        // Instead of throwing an error that crashes the app, set it to state
        set({ error: 'Invalid email or password', loading: false });
      }
    } catch (error) {
      set({ error: 'Server error, please try again.', loading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('sessionToken');
    set({ isAuthenticated: false, user: null });
  }
}));