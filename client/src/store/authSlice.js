import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth Slice
 * Manages user authentication state in Redux
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user credentials after login/register
     */
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },

    /**
     * Clear user credentials on logout
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    /**
     * Update user data
     */
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },

    /**
     * Set loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, updateUser, setLoading } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;

