import { api } from './api';

/**
 * Service API slice
 * Handles service-related API calls using RTK Query
 */
export const serviceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all services
     * @returns {Promise} Services array
     */
    getServices: builder.query({
      query: () => '/services',
      providesTags: ['Service'],
    }),

    /**
     * Get single service by ID
     * @param {String} id - Service ID
     * @returns {Promise} Service data
     */
    getServiceById: builder.query({
      query: (id) => `/services/${id}`,
      providesTags: (result, error, id) => [{ type: 'Service', id }],
    }),

    /**
     * Create a new service
     * @param {Object} data - Service data { name }
     * @returns {Promise} Created service
     */
    createService: builder.mutation({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    /**
     * Update service
     * @param {Object} data - { id, name }
     * @returns {Promise} Updated service
     */
    updateService: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Service',
        { type: 'Service', id },
      ],
    }),

    /**
     * Delete service
     * @param {String} id - Service ID
     * @returns {Promise} Success message
     */
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;
