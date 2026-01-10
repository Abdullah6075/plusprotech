import { api } from './api';

/**
 * Category API slice
 * Handles category-related API calls using RTK Query
 */
export const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all categories
     * @returns {Promise} Categories array
     */
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    /**
     * Get single category by ID
     * @param {String} id - Category ID
     * @returns {Promise} Category data
     */
    getCategoryById: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    /**
     * Create a new category
     * @param {FormData} formData - Category data with image
     * @returns {Promise} Created category
     */
    createCategory: builder.mutation({
      query: (formData) => ({
        url: '/categories',
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      }),
      invalidatesTags: ['Category'],
    }),

    /**
     * Update category
     * @param {Object} data - { id, formData }
     * @returns {Promise} Updated category
     */
    updateCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Category',
        { type: 'Category', id },
      ],
    }),

    /**
     * Delete category
     * @param {String} id - Category ID
     * @returns {Promise} Success message
     */
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

