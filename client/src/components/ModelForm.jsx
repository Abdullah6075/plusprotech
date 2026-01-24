import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateModelMutation,
  useUpdateModelMutation,
} from '../services/modelApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
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
import { ImageIcon, Upload } from 'lucide-react';

/**
 * Model Form Component
 * Used in sidebar for adding/editing models
 */
const ModelForm = ({ model, onSuccess, onClose }) => {
  const [createModel, { isLoading: isCreating }] = useCreateModelMutation();
  const [updateModel, { isLoading: isUpdating }] = useUpdateModelMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const categories = categoriesData?.data?.categories || [];

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL.replace('/api', '')}${imagePath}`;
  };

  useEffect(() => {
    if (model) {
      formik.setValues({
        name: model.name || '',
        categoryId: model.categoryId?._id || model.categoryId || '',
      });
      if (model.image) {
        setImagePreview(getImageUrl(model.image));
      }
    } else {
      formik.resetForm();
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [model]);

  const formik = useFormik({
    initialValues: {
      name: '',
      categoryId: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Model name must be at least 2 characters')
        .max(50, 'Model name cannot exceed 50 characters')
        .required('Model name is required'),
      categoryId: Yup.string()
        .required('Category is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const formData = new FormData();
        formData.append('name', values.name.trim());
        formData.append('categoryId', values.categoryId);

        // Only append image if it's a new file (not editing with existing image)
        if (selectedFile) {
          formData.append('image', selectedFile);
        } else if (!model) {
          // If creating new model without image
          setFieldError('image', 'Model image is required');
          setSubmitting(false);
          return;
        }

        if (model) {
          // Update existing model
          await updateModel({ id: model._id, formData }).unwrap();
        } else {
          // Create new model
          await createModel(formData).unwrap();
        }

        onSuccess();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'image', 'categoryId'].includes(fieldName)) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        formik.setFieldError('image', 'Only image files are allowed');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        formik.setFieldError('image', 'Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      formik.setFieldError('image', null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Category Field */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formik.values.categoryId}
          onValueChange={(value) => formik.setFieldValue('categoryId', value)}
        >
          <SelectTrigger id="categoryId" aria-invalid={formik.touched.categoryId && formik.errors.categoryId ? 'true' : 'false'}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.categoryId && formik.errors.categoryId ? (
          <p className="text-sm text-destructive">{formik.errors.categoryId}</p>
        ) : null}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Model Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter model name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        ) : null}
      </div>

      {/* Image Field */}
      <div className="space-y-2">
        <Label htmlFor="image">
          Model Image {!model && <span className="text-destructive">*</span>}
        </Label>
        <div className="space-y-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {imagePreview ? (
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                )}
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
        {formik.touched.image && formik.errors.image ? (
          <p className="text-sm text-destructive">{formik.errors.image}</p>
        ) : null}
        {model && !selectedFile && (
          <p className="text-xs text-muted-foreground">
            Leave empty to keep current image
          </p>
        )}
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
              {model ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            model ? 'Update Model' : 'Create Model'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ModelForm;
