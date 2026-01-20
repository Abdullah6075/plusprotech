import { api } from './api';

/**
 * Model API slice
 * Handles model-related API calls using RTK Query
 */
export const modelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all models
     * @returns {Promise} Models array
     */
    getModels: builder.query({
      query: () => '/models',
      providesTags: ['Model'],
    }),

    /**
     * Get single model by ID
     * @param {String} id - Model ID
     * @returns {Promise} Model data
     */
    getModelById: builder.query({
      query: (id) => `/models/${id}`,
      providesTags: (result, error, id) => [{ type: 'Model', id }],
    }),

    /**
     * Create a new model
     * @param {FormData} formData - Model data with image
     * @returns {Promise} Created model
     */
    createModel: builder.mutation({
      query: (formData) => ({
        url: '/models',
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      }),
      invalidatesTags: ['Model'],
    }),

    /**
     * Update model
     * @param {Object} data - { id, formData }
     * @returns {Promise} Updated model
     */
    updateModel: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/models/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Model',
        { type: 'Model', id },
      ],
    }),

    /**
     * Delete model
     * @param {String} id - Model ID
     * @returns {Promise} Success message
     */
    deleteModel: builder.mutation({
      query: (id) => ({
        url: `/models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Model'],
    }),
  }),
});

export const {
  useGetModelsQuery,
  useGetModelByIdQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
} = modelApi;
