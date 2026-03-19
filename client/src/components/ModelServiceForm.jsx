import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateModelServiceMutation,
  useUpdateModelServiceMutation,
} from '../services/modelServiceApi';
import { useGetModelsQuery } from '../services/modelApi';
import { useGetServicesQuery } from '../services/serviceApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import { useGetBrandsByCategoryQuery } from '../services/brandApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Info } from 'lucide-react';

/**
 * ModelService Form Component
 * Used in sidebar for adding/editing model services
 * Model selection uses cascading filters: Category → Brand → Model
 */
const ModelServiceForm = ({ modelService, onSuccess, onClose }) => {
  const [createModelService, { isLoading: isCreating }] = useCreateModelServiceMutation();
  const [updateModelService, { isLoading: isUpdating }] = useUpdateModelServiceMutation();

  // Derive initial category/brand from the modelService prop so the cascading
  // filters are correct from the very first render (no flash of empty dropdowns).
  const initCategoryId =
    modelService?.modelId?.categoryId?._id ||
    modelService?.modelId?.categoryId ||
    '';
  const initBrandId =
    modelService?.modelId?.brandId?._id ||
    modelService?.modelId?.brandId ||
    '';

  // Cascading filter state — these are UI filters, not submitted form fields
  const [selectedCategoryId, setSelectedCategoryId] = useState(initCategoryId);
  const [selectedBrandId, setSelectedBrandId] = useState(initBrandId);

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 1000 });
  const { data: brandsData, isFetching: brandsFetching } = useGetBrandsByCategoryQuery(
    selectedCategoryId,
    { skip: !selectedCategoryId }
  );
  const { data: modelsData, isFetching: modelsFetching } = useGetModelsQuery(
    { categoryId: selectedCategoryId, brandId: selectedBrandId, limit: 1000 },
    { skip: !selectedCategoryId || !selectedBrandId }
  );
  const { data: servicesData } = useGetServicesQuery({ limit: 1000 });

  const categories = categoriesData?.data?.categories || [];
  const brands = brandsData?.data?.brands || [];
  const models = modelsData?.data?.models || [];
  const services = servicesData?.data?.services || [];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: modelService?.name || '',
      price: modelService?.price || '',
      discountedPrice: modelService?.discountedPrice || '',
      modelId: modelService?.modelId?._id || modelService?.modelId || '',
      serviceId: modelService?.serviceId?._id || modelService?.serviceId || '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Service name must be at least 2 characters')
        .max(100, 'Service name cannot exceed 100 characters')
        .required('Service name is required'),
      price: Yup.number()
        .min(0, 'Price cannot be negative')
        .required('Price is required'),
      discountedPrice: Yup.number()
        .min(0, 'Discounted price cannot be negative')
        .test('less-than-price', 'Discounted price must be less than or equal to regular price', function(value) {
          if (!value) return true;
          return value <= this.parent.price;
        }),
      modelId: Yup.string().required('Model is required'),
      serviceId: Yup.string().required('Service is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const data = {
          name: values.name.trim(),
          price: parseFloat(values.price),
          discountedPrice: values.discountedPrice ? parseFloat(values.discountedPrice) : undefined,
          modelId: values.modelId,
          serviceId: values.serviceId,
        };

        if (modelService) {
          await updateModelService({ id: modelService._id, ...data }).unwrap();
        } else {
          await createModelService(data).unwrap();
        }

        onSuccess();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'price', 'discountedPrice', 'modelId', 'serviceId'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          setFieldError('name', errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Sync the cascading filter state when the modelService prop changes.
  // Formik values are handled by enableReinitialize above.
  useEffect(() => {
    const catId =
      modelService?.modelId?.categoryId?._id ||
      modelService?.modelId?.categoryId ||
      '';
    const brandId =
      modelService?.modelId?.brandId?._id ||
      modelService?.modelId?.brandId ||
      '';
    setSelectedCategoryId(catId);
    setSelectedBrandId(brandId);
  }, [modelService]);

  const handleCategoryChange = (value) => {
    setSelectedCategoryId(value);
    setSelectedBrandId('');
    formik.setFieldValue('modelId', '');
  };

  const handleBrandChange = (value) => {
    setSelectedBrandId(value);
    formik.setFieldValue('modelId', '');
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Service Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Service Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter service name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        )}
      </div>

      {/* Step 1 — Category filter */}
      <div className="space-y-2">
        <Label>
          Category <span className="text-destructive">*</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">(filter)</span>
        </Label>
        <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2 — Brand filter */}
      <div className="space-y-2">
        <Label>
          Brand <span className="text-destructive">*</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">(filter)</span>
        </Label>
        {!selectedCategoryId ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
            <Info className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">Select a category first to see available brands.</p>
          </div>
        ) : brandsFetching ? (
          <div className="h-10 rounded-md bg-muted animate-pulse" />
        ) : brands.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">No brands found for this category.</p>
          </div>
        ) : (
          <Select value={selectedBrandId} onValueChange={handleBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Step 3 — Model (actual form field, filtered by category + brand) */}
      <div className="space-y-2">
        <Label htmlFor="modelId">
          Model <span className="text-destructive">*</span>
        </Label>
        {!selectedBrandId ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
            <Info className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">Select a category and brand first to see models.</p>
          </div>
        ) : modelsFetching ? (
          <div className="h-10 rounded-md bg-muted animate-pulse" />
        ) : models.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">No models found for this brand and category combination.</p>
          </div>
        ) : (
          <Select
            value={formik.values.modelId}
            onValueChange={(value) => formik.setFieldValue('modelId', value)}
          >
            <SelectTrigger id="modelId" aria-invalid={formik.touched.modelId && formik.errors.modelId ? 'true' : 'false'}>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model._id} value={model._id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {formik.touched.modelId && formik.errors.modelId && (
          <p className="text-sm text-destructive">{formik.errors.modelId}</p>
        )}
      </div>

      {/* Service Field */}
      <div className="space-y-2">
        <Label htmlFor="serviceId">
          Service <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formik.values.serviceId}
          onValueChange={(value) => formik.setFieldValue('serviceId', value)}
        >
          <SelectTrigger id="serviceId" aria-invalid={formik.touched.serviceId && formik.errors.serviceId ? 'true' : 'false'}>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service._id} value={service._id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.serviceId && formik.errors.serviceId && (
          <p className="text-sm text-destructive">{formik.errors.serviceId}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter price"
          value={formik.values.price}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.price && formik.errors.price ? 'true' : 'false'}
        />
        {formik.touched.price && formik.errors.price && (
          <p className="text-sm text-destructive">{formik.errors.price}</p>
        )}
      </div>

      {/* Discounted Price */}
      <div className="space-y-2">
        <Label htmlFor="discountedPrice">
          Discounted Price <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="discountedPrice"
          name="discountedPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter discounted price"
          value={formik.values.discountedPrice}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.discountedPrice && formik.errors.discountedPrice ? 'true' : 'false'}
        />
        {formik.touched.discountedPrice && formik.errors.discountedPrice && (
          <p className="text-sm text-destructive">{formik.errors.discountedPrice}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || formik.isSubmitting}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {modelService ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            modelService ? 'Update Model Service' : 'Create Model Service'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ModelServiceForm;
