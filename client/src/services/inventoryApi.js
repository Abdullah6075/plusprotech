import { api } from './api';

/**
 * Inventory API slice
 * Handles inventory-related API calls using RTK Query
 */
export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all inventory items with pagination
     * @param {Object} params - Query parameters { page, limit }
     * @returns {Promise} Inventory array with pagination
     */
    getInventory: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        const queryString = queryParams.toString();
        return `/inventory${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Inventory'],
    }),

    /**
     * Get single inventory item by ID
     * @param {String} id - Inventory ID
     * @returns {Promise} Inventory data
     */
    getInventoryById: builder.query({
      query: (id) => `/inventory/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    /**
     * Create a new inventory item
     * @param {Object} data - Inventory data { name, description, price, quantity, unit }
     * @returns {Promise} Created inventory
     */
    createInventory: builder.mutation({
      query: (data) => ({
        url: '/inventory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inventory'],
    }),

    /**
     * Update inventory item
     * @param {Object} data - { id, ...updateData }
     * @returns {Promise} Updated inventory
     */
    updateInventory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Inventory',
        { type: 'Inventory', id },
      ],
    }),

    /**
     * Delete inventory item
     * @param {String} id - Inventory ID
     * @returns {Promise} Success message
     */
    deleteInventory: builder.mutation({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = inventoryApi;
