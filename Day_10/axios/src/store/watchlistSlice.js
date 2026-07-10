import { createSlice } from '@reduxjs/toolkit';

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    items: [],
  },
  reducers: {
    addToWatchlist: (state, action) => {
      const exists = state.items.some((movie) => movie.imdbID === action.payload.imdbID);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action) => {
      state.items = state.items.filter((movie) => movie.imdbID !== action.payload);
    },
  },
});

export const { addToWatchlist, removeFromWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;