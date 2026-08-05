import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  bookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setRooms: (state, action) => {
      const payload = action.payload;
      state.rooms = Array.isArray(payload) ? payload : [];
      state.loading = false;
      state.error = null;
    },
    
    setBookings: (state, action) => {
      const payload = action.payload;
      state.bookings = Array.isArray(payload) ? payload : [];
      state.loading = false;
      state.error = null;
    },
    
    startBookingLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
  
    setBookingError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  startBookingLoading,
  setRooms,
  setBookings,
  setBookingError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
