import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isModalVisible: false,
    editingStudent: null,
  },
  reducers: {
    openModal: (state, action) => {
      state.isModalVisible = true;
      state.editingStudent = action.payload || null;
    },
    closeModal: (state) => {
      state.isModalVisible = false;
      state.editingStudent = null;
    },
  },
});

export const { openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;