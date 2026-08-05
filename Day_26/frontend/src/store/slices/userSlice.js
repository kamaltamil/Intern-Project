import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  searchList: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startUserLoading: (state, action) => {
      state.loading = action.payload ?? false;
      state.error = null;
    },

    setUsers: (state, action) => {
      state.users = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    setSearchUser: (state, action) => {
      state.searchList = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    setUserError: (state, action) => {
      state.loading = false;
      state.error = action.payload || null;
    },
  },
});

export const {
  startUserLoading,
  setUsers,
  setSearchUser,
  setUserError,
} = userSlice.actions;

export default userSlice.reducer;
