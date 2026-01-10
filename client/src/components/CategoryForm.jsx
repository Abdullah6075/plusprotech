import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../services/categoryApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ImageIcon, Upload } from 'lucide-react';

/**
 * Category Form Component
 * Used in sidebar for adding/editing categories
 */
const CategoryForm = ({ category, onSuccess, onClose }) => {
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL.replace('/api', '')}${imagePath}`;
  };

  useEffect(() => {
    if (category) {
      formik.setValues({
        name: category.name || '',
      });
      if (category.image) {
        setImagePreview(getImageUrl(category.image));
      }
    } else {
      formik.resetForm();
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [category]);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Category name must be at least 2 characters')
        .max(50, 'Category name cannot exceed 50 characters')
        .required('Category name is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const formData = new FormData();
        formData.append('name', values.name.trim());

        // Only append image if it's a new file (not editing with existing image)
        if (selectedFile) {
          formData.append('image', selectedFile);
        } else if (!category) {
          // If creating new category without image
          setFieldError('image', 'Category image is required');
          setSubmitting(false);
          return;
        }

        if (category) {
          // Update existing category
          await updateCategory({ id: category._id, formData }).unwrap();
        } else {
          // Create new category
          await createCategory(formData).unwrap();
        }

        onSuccess();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'image'].includes(fieldName)) {
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
    <form onSubmit={formik.handleSubmit} className="space-y-6 mt-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Category Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter category name"
          className="w-full"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="mt-1.5 text-sm text-red-600">{formik.errors.name}</p>
        ) : null}
      </div>

      {/* Image Field */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Category Image {!category && <span className="text-red-500">*</span>}
        </label>
        <div className="space-y-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
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
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {imagePreview ? (
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                ) : (
                  <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
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
          <p className="mt-1.5 text-sm text-red-600">{formik.errors.image}</p>
        ) : null}
        {category && !selectedFile && (
          <p className="mt-1.5 text-xs text-gray-500">
            Leave empty to keep current image
          </p>
        )}
      </div>

      {/* Error Message */}
      {formik.errors.name && formik.touched.name && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{formik.errors.name}</p>
        </div>
      )}

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
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {category ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            category ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;

