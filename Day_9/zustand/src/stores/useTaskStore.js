import { create } from 'zustand';
import API from '../services/api';

export const useTaskStore = create((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/tasks');
      set({ items: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/tasks', task);
      set((state) => ({ items: [...state.items, response.data], loading: false }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));