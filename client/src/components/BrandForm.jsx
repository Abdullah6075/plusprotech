import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateBrandMutation, useUpdateBrandMutation } from '../services/brandApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { ImageIcon, Upload, CheckSquare, Square } from 'lucide-react';

const BrandForm = ({ brand, onSuccess, onClose }) => {
    const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
    const { data: categoriesData } = useGetCategoriesQuery();
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const categories = categoriesData?.data?.categories || [];

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL;
        return `${baseUrl}${imagePath}`;
    };

    useEffect(() => {
        if (brand) {
            // brand.categories may be an array of objects {_id, name} or strings
            const existingCategoryIds = (brand.categories || []).map((c) =>
                typeof c === 'object' ? c._id : c
            );
            formik.setValues({ name: brand.name || '', categories: existingCategoryIds });
            if (brand.image) setImagePreview(getImageUrl(brand.image));
        } else {
            formik.resetForm();
            setImagePreview(null);
            setSelectedFile(null);
        }
    }, [brand]);

    const formik = useFormik({
        initialValues: { name: '', categories: [] },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Brand name must be at least 2 characters')
                .max(50, 'Brand name cannot exceed 50 characters')
                .required('Brand name is required'),
            categories: Yup.array()
                .min(1, 'Select at least one category for this brand')
                .required('At least one category is required'),
        }),
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const formData = new FormData();
                formData.append('name', values.name.trim());
                // Send categories as JSON string (multer doesn't parse arrays)
                formData.append('categories', JSON.stringify(values.categories));
                if (selectedFile) formData.append('image', selectedFile);

                if (brand) {
                    await updateBrand({ id: brand._id, formData }).unwrap();
                } else {
                    await createBrand(formData).unwrap();
                }
                onSuccess();
            } catch (err) {
                const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
                if (err?.data?.errors && Array.isArray(err.data.errors)) {
                    err.data.errors.forEach((e) => {
                        if (e.field === 'name') setFieldError('name', e.message);
                    });
                } else {
                    setFieldError('name', errorMessage);
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const toggleCategory = (categoryId) => {
        const current = formik.values.categories;
        const next = current.includes(categoryId)
            ? current.filter((id) => id !== categoryId)
            : [...current, categoryId];
        formik.setFieldValue('categories', next);
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
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const isLoading = isCreating || isUpdating;

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="brand-name">
                    Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="brand-name" name="name" type="text"
                    placeholder="e.g. Samsung, Apple, Infinix"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
                />
                {formik.touched.name && formik.errors.name && (
                    <p className="text-sm text-destructive">{formik.errors.name}</p>
                )}
            </div>

            {/* Categories multi-select */}
            <div className="space-y-2">
                <Label>
                    Applicable Categories <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                    Select all categories this brand belongs to. Only these categories will show this brand.
                </p>
                <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                    {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">No categories available</p>
                    ) : (
                        categories.map((category) => {
                            const isChecked = formik.values.categories.includes(category._id);
                            return (
                                <button
                                    key={category._id}
                                    type="button"
                                    onClick={() => toggleCategory(category._id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                        isChecked
                                            ? 'bg-[#EC4421]/5 text-[#EC4421]'
                                            : 'hover:bg-accent text-foreground'
                                    }`}
                                >
                                    {isChecked ? (
                                        <CheckSquare className="w-4 h-4 shrink-0 text-[#EC4421]" />
                                    ) : (
                                        <Square className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">{category.name}</span>
                                </button>
                            );
                        })
                    )}
                </div>
                {formik.touched.categories && formik.errors.categories && (
                    <p className="text-sm text-destructive">{formik.errors.categories}</p>
                )}
                {formik.values.categories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {formik.values.categories.length} categor{formik.values.categories.length === 1 ? 'y' : 'ies'} selected
                    </p>
                )}
            </div>

            {/* Image (optional) */}
            <div className="space-y-2">
                <Label htmlFor="brand-image">
                    Brand Logo <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <div className="space-y-3">
                    {imagePreview && (
                        <div className="relative w-full h-36 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/30">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                        </div>
                    )}
                    <label
                        htmlFor="brand-image-upload"
                        className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-4 pb-5">
                            {imagePreview ? (
                                <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                            ) : (
                                <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                            )}
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> brand logo
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                        </div>
                        <input
                            id="brand-image-upload" type="file" className="hidden"
                            accept="image/*" onChange={handleImageChange}
                        />
                    </label>
                </div>
                {brand && !selectedFile && brand.image && (
                    <p className="text-xs text-muted-foreground">Leave empty to keep current logo</p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
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
                            {brand ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        brand ? 'Update Brand' : 'Create Brand'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default BrandForm;
