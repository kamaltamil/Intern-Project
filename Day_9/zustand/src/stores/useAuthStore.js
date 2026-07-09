import { create } from 'zustand';
import API from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: false,
  error: null,
  
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/users?email=${credentials.email}&password=${credentials.password}`);
      
      if (response.data.length > 0) {
        const user = response.data[0];
        localStorage.setItem('user', JSON.stringify(user));
        set({ isAuthenticated: true, user, loading: false });
      } else {
        set({ error: 'Invalid email or password', loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ isAuthenticated: false, user: null });
  }
}));