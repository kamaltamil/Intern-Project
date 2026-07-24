import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import taskReducer from "./taskSlice";
import userReducer from "./userSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  users: userReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PAUSE",
        ],
      },
    }),
});

export const persistor = persistStore(store);
