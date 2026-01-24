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
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Get token from Redux state
      const token = getState().auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
    fetchFn: async (url, options = {}) => {
      // Handle FormData properly
      if (options.body instanceof FormData) {
        // Create new headers without Content-Type for FormData
        // Browser will automatically set Content-Type with boundary
        const headers = new Headers(options.headers);
        headers.delete('Content-Type');
        options.headers = headers;
      } else if (options.body && !options.headers?.['Content-Type']) {
        // Set Content-Type for JSON requests
        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');
        options.headers = headers;
      }
      
      return fetch(url, options);
    },
  }),
  tagTypes: ['User', 'Category', 'Service', 'Model', 'ModelService', 'Appointment'],
  endpoints: (builder) => ({}),
});

