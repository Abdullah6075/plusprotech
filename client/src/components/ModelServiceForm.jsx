import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateModelServiceMutation,
  useUpdateModelServiceMutation,
} from '../services/modelServiceApi';
import { useGetModelsQuery } from '../services/modelApi';
import { useGetServicesQuery } from '../services/serviceApi';
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

/**
 * ModelService Form Component
 * Used in sidebar for adding/editing model services
 */
const ModelServiceForm = ({ modelService, onSuccess, onClose }) => {
  const [createModelService, { isLoading: isCreating }] = useCreateModelServiceMutation();
  const [updateModelService, { isLoading: isUpdating }] = useUpdateModelServiceMutation();
  const { data: modelsData } = useGetModelsQuery();
  const { data: servicesData } = useGetServicesQuery();

  const models = modelsData?.data?.models || [];
  const services = servicesData?.data?.services || [];

  useEffect(() => {
    if (modelService) {
      formik.setValues({
        name: modelService.name || '',
        price: modelService.price || '',
        discountedPrice: modelService.discountedPrice || '',
        modelId: modelService.modelId?._id || modelService.modelId || '',
        serviceId: modelService.serviceId?._id || modelService.serviceId || '',
      });
    } else {
      formik.resetForm();
    }
  }, [modelService]);

  const formik = useFormik({
    initialValues: {
      name: '',
      price: '',
      discountedPrice: '',
      modelId: '',
      serviceId: '',
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
          if (!value) return true; // Optional field
          return value <= this.parent.price;
        }),
      modelId: Yup.string()
        .required('Model is required'),
      serviceId: Yup.string()
        .required('Service is required'),
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
          // Update existing model service
          await updateModelService({ id: modelService._id, ...data }).unwrap();
        } else {
          // Create new model service
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

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Name Field */}
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
        {formik.touched.name && formik.errors.name ? (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        ) : null}
      </div>

      {/* Model Field */}
      <div className="space-y-2">
        <Label htmlFor="modelId">
          Model <span className="text-destructive">*</span>
        </Label>
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
        {formik.touched.modelId && formik.errors.modelId ? (
          <p className="text-sm text-destructive">{formik.errors.modelId}</p>
        ) : null}
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
        {formik.touched.serviceId && formik.errors.serviceId ? (
          <p className="text-sm text-destructive">{formik.errors.serviceId}</p>
        ) : null}
      </div>

      {/* Price Field */}
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
        {formik.touched.price && formik.errors.price ? (
          <p className="text-sm text-destructive">{formik.errors.price}</p>
        ) : null}
      </div>

      {/* Discounted Price Field */}
      <div className="space-y-2">
        <Label htmlFor="discountedPrice">
          Discounted Price (Optional)
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
        {formik.touched.discountedPrice && formik.errors.discountedPrice ? (
          <p className="text-sm text-destructive">{formik.errors.discountedPrice}</p>
        ) : null}
      </div>

      {/* Submit Buttons */}
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
