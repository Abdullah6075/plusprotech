import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API - adjust this to match your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Base API configuration with RTK Query
 * Handles authentication tokens automatically
 */
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const token = getState().auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({}),
});

