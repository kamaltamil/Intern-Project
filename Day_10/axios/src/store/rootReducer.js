import { combineReducers } from '@reduxjs/toolkit';
import watchlistReducer from './watchlistSlice';
import moviesReducer from './moviesSlice'; // Import the new slice

const rootReducer = combineReducers({
  watchlist: watchlistReducer,
  movies: moviesReducer, // Add it to the global state object
});

export default rootReducer;