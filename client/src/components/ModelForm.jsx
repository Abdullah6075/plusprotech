import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateModelMutation,
  useUpdateModelMutation,
} from '../services/modelApi';
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
import { ImageIcon, Upload, Info } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

const ModelForm = ({ model, onSuccess, onClose }) => {
  const [createModel, { isLoading: isCreating }] = useCreateModelMutation();
  const [updateModel, { isLoading: isUpdating }] = useUpdateModelMutation();
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 1000 });
  const [imagePreview, setImagePreview] = useState(
    model?.image ? getImageUrl(model.image) : null
  );
  const [selectedFile, setSelectedFile] = useState(null);

  const categories = categoriesData?.data?.categories || [];

  // Tracks which category is selected to drive the brand sub-query
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    model?.categoryId?._id || model?.categoryId || ''
  );

  const { data: brandsData, isFetching: brandsFetching } = useGetBrandsByCategoryQuery(
    selectedCategoryId,
    { skip: !selectedCategoryId }
  );
  const brands = brandsData?.data?.brands || [];

  // Build initial values from the model prop so the Select trigger shows correctly
  // on the very first render (no flash of empty → populated).
  const initialCategoryId = model?.categoryId?._id || model?.categoryId || '';
  const initialBrandId = model?.brandId?._id || model?.brandId || '';

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: model?.name || '',
      categoryId: initialCategoryId,
      brandId: initialBrandId,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Model name must be at least 2 characters')
        .max(50, 'Model name cannot exceed 50 characters')
        .required('Model name is required'),
      categoryId: Yup.string().required('Category is required'),
      brandId: Yup.string().required('Brand is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const formData = new FormData();
        formData.append('name', values.name.trim());
        formData.append('categoryId', values.categoryId);
        if (values.brandId) formData.append('brandId', values.brandId);

        if (selectedFile) {
          formData.append('image', selectedFile);
        } else if (!model) {
          setFieldError('image', 'Model image is required');
          setSubmitting(false);
          return;
        }

        if (model) {
          await updateModel({ id: model._id, formData }).unwrap();
        } else {
          await createModel(formData).unwrap();
        }
        onSuccess();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'image', 'categoryId', 'brandId'].includes(fieldName)) {
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

  // Sync side-effects that can't live in initialValues:
  // selectedCategoryId state (drives brand query) and image preview
  useEffect(() => {
    if (model) {
      const catId = model.categoryId?._id || model.categoryId || '';
      setSelectedCategoryId(catId);
      setImagePreview(model.image ? getImageUrl(model.image) : null);
    } else {
      setSelectedCategoryId('');
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [model]);

  const handleCategoryChange = (value) => {
    formik.setFieldValue('categoryId', value);
    formik.setFieldValue('brandId', '');
    setSelectedCategoryId(value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      formik.setFieldError('image', 'Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      formik.setFieldError('image', 'Image size must be less than 5MB');
      return;
    }
    setSelectedFile(file);
    formik.setFieldError('image', null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select value={formik.values.categoryId} onValueChange={handleCategoryChange}>
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
        {formik.touched.categoryId && formik.errors.categoryId && (
          <p className="text-sm text-destructive">{formik.errors.categoryId}</p>
        )}
      </div>

      {/* Brand — filtered by selected category */}
      <div className="space-y-2">
        <Label htmlFor="brandId">
          Brand <span className="text-destructive">*</span>
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
            <p className="text-sm text-amber-700">
              No brands are registered for this category. Go to <strong>Brands</strong> and assign this category to a brand first.
            </p>
          </div>
        ) : (
          <Select
            value={formik.values.brandId}
            onValueChange={(value) => formik.setFieldValue('brandId', value)}
          >
            <SelectTrigger id="brandId" aria-invalid={formik.touched.brandId && formik.errors.brandId ? 'true' : 'false'}>
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

        {formik.touched.brandId && formik.errors.brandId && (
          <p className="text-sm text-destructive">{formik.errors.brandId}</p>
        )}
      </div>

      {/* Model Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Model Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name" name="name" type="text" placeholder="Enter model name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        )}
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label htmlFor="image">
          Model Image {!model && <span className="text-destructive">*</span>}
        </Label>
        <div className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
              <img src={imagePreview} alt="Preview" loading="eager" decoding="async" className="w-full h-full object-contain p-2" />
            </div>
          )}
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
            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
        {formik.touched.image && formik.errors.image && (
          <p className="text-sm text-destructive">{formik.errors.image}</p>
        )}
        {model && !selectedFile && (
          <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading || formik.isSubmitting}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
