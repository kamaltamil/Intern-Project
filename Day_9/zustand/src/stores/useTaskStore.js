import { create } from 'zustand';
import API from '../services/api';

export const useTaskStore = create((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchTasks: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await API.get(`/tasks?userId=${userId}`);
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
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await API.patch(`/tasks/${id}`, { status });
      set((state) => ({
        items: state.items.map(t => t.id === id ? response.data : t)
      }));
    } catch (error) {
      throw error;
    }
  }
}));