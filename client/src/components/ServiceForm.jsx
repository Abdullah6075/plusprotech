import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from '../services/serviceApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

/**
 * Service Form Component
 * Used in sidebar for adding/editing services
 */
const ServiceForm = ({ service, onSuccess, onClose }) => {
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  useEffect(() => {
    if (service) {
      formik.setValues({
        name: service.name || '',
      });
    } else {
      formik.resetForm();
    }
  }, [service]);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Service name must be at least 2 characters')
        .max(50, 'Service name cannot exceed 50 characters')
        .required('Service name is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        if (service) {
          // Update existing service
          await updateService({ id: service._id, name: values.name.trim() }).unwrap();
        } else {
          // Create new service
          await createService({ name: values.name.trim() }).unwrap();
        }

        onSuccess();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name'].includes(fieldName)) {
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
              {service ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            service ? 'Update Service' : 'Create Service'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
