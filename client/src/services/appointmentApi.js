import { api } from './api';

/**
 * Appointment API slice
 * Handles appointment-related API calls using RTK Query
 */
export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all appointments
     * Admin sees all, customer sees only their own
     * @param {Object} params - Query parameters { status, search }
     * @returns {Promise} Appointments array
     */
    getAppointments: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        const queryString = queryParams.toString();
        return `/appointments${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Appointment'],
    }),

    /**
     * Get single appointment by ID
     * @param {String} id - Appointment ID
     * @returns {Promise} Appointment data
     */
    getAppointmentById: builder.query({
      query: (id) => `/appointments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),

    /**
     * Create a new appointment
     * @param {Object} data - Appointment data { title, description, name, contactPhone, contactEmail, date, time, modelId, modelServiceId }
     * @returns {Promise} Created appointment
     */
    createAppointment: builder.mutation({
      query: (data) => ({
        url: '/appointments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Appointment'],
    }),

    /**
     * Update appointment
     * @param {Object} data - { id, ...updateData }
     * @returns {Promise} Updated appointment
     */
    updateAppointment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Appointment',
        { type: 'Appointment', id },
      ],
    }),

    /**
     * Delete appointment
     * @param {String} id - Appointment ID
     * @returns {Promise} Success message
     */
    deleteAppointment: builder.mutation({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentApi;
