import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import bookingReducer from './slices/bookingSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  booking: bookingReducer,
  user: userReducer,
  role: roleReducer,
});

const migrations = {
  1: (state) => ({
    ...state,
    auth: {
      ...state?.auth,
      refreshToken: null,
      role: state?.auth?.role || "Member",
      theme: state?.auth?.theme || "light",
      loading: false,
      error: null,
    },
  }),
};

const persistConfig = {
  key: 'hotel-dashboard-auth',
  version: 1,
  storage,
  whitelist: ['auth', 'user', 'dashboard', 'role'],
  migrate: createMigrate(migrations, { debug: false }),
};

const persistedRootReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export const persistor = persistStore(store);