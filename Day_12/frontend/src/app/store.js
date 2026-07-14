// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import filterReducer from '../features/filterSlice';
import postsReducer from '../features/postsSlice';

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    posts: postsReducer,
  },
});