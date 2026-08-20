import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rooms: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

const roomSlice = createSlice({
  name: "room",

  initialState,

  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload || [];
    },

    addRoom: (state, action) => {
      state.rooms.push(action.payload);
    },

    updateRoom: (state, action) => {
      const updatedRoom = action.payload;

      const index = state.rooms.findIndex(
        (room) => room._id === updatedRoom._id
      );

      if (index !== -1) {
        state.rooms[index] = updatedRoom;
      }
    },

    removeRoom: (state, action) => {
      state.rooms = state.rooms.filter(
        (room) => room._id !== action.payload
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCreating: (state, action) => {
      state.creating = action.payload;
    },

    setUpdating: (state, action) => {
      state.updating = action.payload;
    },

    setDeleting: (state, action) => {
      state.deleting = action.payload;
    },

    setRoomError: (state, action) => {
      state.error = action.payload;
    },

    setCreateError: (state, action) => {
      state.createError = action.payload;
    },

    setUpdateError: (state, action) => {
      state.updateError = action.payload;
    },

    setDeleteError: (state, action) => {
      state.deleteError = action.payload;
    },

    clearRoomErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
});

export const {
  setRooms,
  addRoom,
  updateRoom,
  removeRoom,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setRoomError,
  setCreateError,
  setUpdateError,
  setDeleteError,
  clearRoomErrors,
} = roomSlice.actions;

export default roomSlice.reducer;