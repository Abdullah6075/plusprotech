import { api } from './api';

/**
 * Auth API slice
 * Handles authentication-related API calls using RTK Query
 */
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Register a new user
     * @param {Object} credentials - User registration data
     * @returns {Promise} User data and token
     */
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Login user
     * @param {Object} credentials - Email and password
     * @returns {Promise} User data and token
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Forgot password - Reset password using secret code
     * @param {Object} data - Email, secretCode, and newPassword
     * @returns {Promise} Success message
     */
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Get current user
     * @returns {Promise} Current user data
     */
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useGetMeQuery,
} = authApi;

