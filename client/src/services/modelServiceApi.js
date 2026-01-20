import { api } from './api';

/**
 * ModelService API slice
 * Handles model service-related API calls using RTK Query
 */
export const modelServiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all model services
     * @param {Object} params - Query parameters { modelId, serviceId }
     * @returns {Promise} Model services array
     */
    getModelServices: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.modelId) queryParams.append('modelId', params.modelId);
        if (params.serviceId) queryParams.append('serviceId', params.serviceId);
        const queryString = queryParams.toString();
        return `/model-services${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['ModelService'],
    }),

    /**
     * Get single model service by ID
     * @param {String} id - Model Service ID
     * @returns {Promise} Model service data
     */
    getModelServiceById: builder.query({
      query: (id) => `/model-services/${id}`,
      providesTags: (result, error, id) => [{ type: 'ModelService', id }],
    }),

    /**
     * Create a new model service
     * @param {Object} data - Model service data { name, price, discountedPrice, modelId, serviceId }
     * @returns {Promise} Created model service
     */
    createModelService: builder.mutation({
      query: (data) => ({
        url: '/model-services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ModelService'],
    }),

    /**
     * Update model service
     * @param {Object} data - { id, ...updateData }
     * @returns {Promise} Updated model service
     */
    updateModelService: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/model-services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'ModelService',
        { type: 'ModelService', id },
      ],
    }),

    /**
     * Delete model service
     * @param {String} id - Model Service ID
     * @returns {Promise} Success message
     */
    deleteModelService: builder.mutation({
      query: (id) => ({
        url: `/model-services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ModelService'],
    }),
  }),
});

export const {
  useGetModelServicesQuery,
  useGetModelServiceByIdQuery,
  useCreateModelServiceMutation,
  useUpdateModelServiceMutation,
  useDeleteModelServiceMutation,
} = modelServiceApi;
