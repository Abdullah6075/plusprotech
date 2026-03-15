import { api } from './api';

export const brandApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query({
      query: () => '/brands',
      providesTags: ['Brand'],
    }),

    getBrandsByCategory: builder.query({
      query: (categoryId) => `/brands/by-category/${categoryId}`,
      providesTags: ['Brand'],
    }),

    getBrandById: builder.query({
      query: (id) => `/brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),

    createBrand: builder.mutation({
      query: (formData) => ({
        url: '/brands',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Brand'],
    }),

    updateBrand: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/brands/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => ['Brand', { type: 'Brand', id }],
    }),

    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brand'],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandsByCategoryQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
