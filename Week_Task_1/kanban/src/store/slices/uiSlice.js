import { createSlice } from '@reduxjs/toolkit';

const THEME_KEY = 'kanban_theme';
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeBoardId: 'board-1',
    sidebarOpen: true,
    theme: savedTheme,
  },
  reducers: {
    setActiveBoardId(state, action) {
      state.activeBoardId = String(action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, state.theme);
    },
  },
});

export const { setActiveBoardId, toggleSidebar, setSidebarOpen, toggleTheme } =
  uiSlice.actions;
export default uiSlice.reducer;
