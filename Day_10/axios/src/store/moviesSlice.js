import { createSlice } from '@reduxjs/toolkit';

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    items: [],
  },
  reducers: {
    // Replaces the current list of movies with new search results
    setAllMovies: (state, action) => {
      state.items = action.payload;
    },
    // Optional: Clears the movie list
    clearAllMovies: (state) => {
      state.items = [];
    },
  },
});

export const { setAllMovies, clearAllMovies } = moviesSlice.actions;
export default moviesSlice.reducer;