import { api } from './api';

/**
 * Invoice API slice
 * Handles invoice-related API calls using RTK Query
 */
export const invoiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get invoice by appointment ID
     * @param {String} appointmentId - Appointment ID
     * @returns {Promise} Invoice data
     */
    getInvoiceByAppointmentId: builder.query({
      query: (appointmentId) => `/invoices/appointment/${appointmentId}`,
      providesTags: (result, error, appointmentId) => [
        { type: 'Invoice', id: appointmentId },
      ],
    }),

    /**
     * Get invoice by ID
     * @param {String} id - Invoice ID
     * @returns {Promise} Invoice data
     */
    getInvoiceById: builder.query({
      query: (id) => `/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),

    /**
     * Create a new invoice
     * @param {Object} data - Invoice data { appointmentId, items: [{ inventoryId, quantity }] }
     * @returns {Promise} Created invoice
     */
    createInvoice: builder.mutation({
      query: (data) => ({
        url: '/invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoice', 'Appointment'],
    }),
  }),
});

export const {
  useGetInvoiceByAppointmentIdQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
} = invoiceApi;
