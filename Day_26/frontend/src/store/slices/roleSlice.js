import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roles: [],
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    startRoleLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setRoles: (state, action) => {
      state.roles = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    addRole: (state, action) => {
      state.roles.push(action.payload);
      state.loading = false;
      state.error = null;
    },

    updateRole: (state, action) => {
      const updated = action.payload;
      const idx = state.roles.findIndex((r) => r._id === updated._id);
      if (idx !== -1) state.roles[idx] = updated;
      state.loading = false;
    },

    removeRole: (state, action) => {
      state.roles = state.roles.filter((r) => r._id !== action.payload);
      state.loading = false;
    },

    setRoleError: (state, action) => {
      state.loading = false;
      state.error = action.payload || null;
    },
  },
});

export const {
  startRoleLoading,
  setRoles,
  addRole,
  updateRole,
  removeRole,
  setRoleError,
} = roleSlice.actions;

export default roleSlice.reducer;
