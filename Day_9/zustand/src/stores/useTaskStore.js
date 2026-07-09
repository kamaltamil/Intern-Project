import { create } from 'zustand';
import API from '../services/api';

export const useTaskStore = create((set) => ({
  items: [],
  loading: false,
  
  fetchTasks: async (userId) => {
    set({ loading: true });
    try {
      const response = await API.get(`/tasks?userId=${userId}`);
      set({ items: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error("Failed to fetch tasks", error);
    }
  },
  addTask: async (task) => {
    const res = await API.post('/tasks', task);
    set((state) => ({ items: [...state.items, res.data] }));
  },
  updateTaskStatus: async (id, status) => {
    const res = await API.patch(`/tasks/${id}`, { status });
    set((state) => ({
      items: state.items.map(t => t.id === id ? res.data : t)
    }));
  }
}));