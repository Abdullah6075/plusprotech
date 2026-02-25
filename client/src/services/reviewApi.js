import { api } from './api';

/**
 * Review API slice
 * Handles review-related API calls using RTK Query
 */
export const reviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all reviews
     * @param {Object} params - Query parameters { showInLandingPage }
     * @returns {Promise} Reviews array
     */
    getReviews: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.showInLandingPage !== undefined) {
          queryParams.append('showInLandingPage', params.showInLandingPage);
        }
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        const queryString = queryParams.toString();
        return `/reviews${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Review'],
    }),

    /**
     * Get single review by ID
     * @param {String} id - Review ID
     * @returns {Promise} Review data
     */
    getReviewById: builder.query({
      query: (id) => `/reviews/${id}`,
      providesTags: (result, error, id) => [{ type: 'Review', id }],
    }),

    /**
     * Create a new review
     * @param {Object} data - Review data { name, rating, review }
     * @returns {Promise} Created review
     */
    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Review'],
    }),

    /**
     * Update review
     * @param {Object} data - { id, ...updateData }
     * @returns {Promise} Updated review
     */
    updateReview: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Review',
        { type: 'Review', id },
      ],
    }),

    /**
     * Toggle showInLandingPage flag
     * @param {Object} data - { id, showInLandingPage }
     * @returns {Promise} Updated review
     */
    toggleShowInLandingPage: builder.mutation({
      query: ({ id, showInLandingPage }) => ({
        url: `/reviews/${id}/toggle-landing-page`,
        method: 'PATCH',
        body: { showInLandingPage },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Review',
        { type: 'Review', id },
      ],
    }),

    /**
     * Delete review
     * @param {String} id - Review ID
     * @returns {Promise} Success message
     */
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useToggleShowInLandingPageMutation,
  useDeleteReviewMutation,
} = reviewApi;
