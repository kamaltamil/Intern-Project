import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  fetchRooms as fetchRoomsApi,
  createRoom as createRoomApi,
  updateRoom as updateRoomApi,
  deleteRoom as deleteRoomApi,
} from "../../api/queries";

export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const rooms = await fetchRoomsApi();
      return Array.isArray(rooms) ? rooms : [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch rooms"
      );
    }
  }
);

export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (payload, { rejectWithValue }) => {
    try {
      return await createRoomApi(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create room"
      );
    }
  }
);

export const updateRoom = createAsyncThunk(
  "room/updateRoom",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateRoomApi({ id, payload });
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update room"
      );
    }
  }
);

export const deleteRoom = createAsyncThunk(
  "room/deleteRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      await deleteRoomApi(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete room"
      );
    }
  }
);

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
    clearRoomErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload || [];
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch rooms";
      })
      .addCase(createRoom.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.creating = false;
        const createdRoom =
          action.payload?.result || action.payload?.room || action.payload;

        if (createdRoom?._id) {
          state.rooms.push(createdRoom);
        }
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Failed to create room";
      })
      .addCase(updateRoom.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.updating = false;
        const updatedRoom = action.payload?.room || action.payload;

        if (updatedRoom?._id) {
          const index = state.rooms.findIndex(
            (room) => room._id === updatedRoom._id
          );

          if (index !== -1) {
            state.rooms[index] = updatedRoom;
          }
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update room";
      })
      .addCase(deleteRoom.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.deleting = false;
        state.rooms = state.rooms.filter(
          (room) => room._id !== action.payload
        );
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Failed to delete room";
      });
  },
});

export const { clearRoomErrors } = roomSlice.actions;
export default roomSlice.reducer;
