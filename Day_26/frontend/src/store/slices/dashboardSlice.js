import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: [],
  bookings: [],
  users: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    startDashboardLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setDashboardData: (state, action) => {
      const payload = action.payload || {};
      state.stats = payload.stats || [];
      state.bookings = payload.bookings || [];
      state.users = payload.users || [];
      state.loading = false;
      state.error = null;
    },

    setDashboardError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  startDashboardLoading,
  setDashboardData,
  setDashboardError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
