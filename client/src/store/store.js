import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { api } from '../services/api';
import authReducer from './authSlice';

/**
 * Redux Persist configuration
 * Persists auth state to localStorage
 */
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Only persist these fields
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

/**
 * Redux Store configuration
 */
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
});

// Setup RTK Query listeners for refetching
setupListeners(store.dispatch);

export const persistor = persistStore(store);

