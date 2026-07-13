import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
  },
});

export default store;
