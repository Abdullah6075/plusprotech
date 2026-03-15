import React, { useState } from 'react';
import {
    useGetBrandsQuery,
    useDeleteBrandMutation,
    useCreateBrandMutation,
    useUpdateBrandMutation,
} from '../services/brandApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Edit, Trash2, Image as ImageIcon, Tag } from 'lucide-react';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import BrandForm from '../components/BrandForm';

const Brands = () => {
    const { data, isLoading, error } = useGetBrandsQuery();
    const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL;
        return `${baseUrl}${imagePath}`;
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (brand) => {
        setBrandToDelete(brand);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!brandToDelete) return;
        try {
            await deleteBrand(brandToDelete._id).unwrap();
            setDeleteDialogOpen(false);
            setBrandToDelete(null);
        } catch (err) {
            alert(err?.data?.error || 'Failed to delete brand');
        }
    };

    const handleClose = () => {
        setIsSheetOpen(false);
        setEditingBrand(null);
    };

    const handleSuccess = () => {
        setIsSheetOpen(false);
        setEditingBrand(null);
    };

    const brands = data?.data?.brands || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}><Skeleton className="h-32 w-full" /></Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-destructive">Failed to load brands.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage device brands. Brands are linked to models to organise the service flow.
                    </p>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <Button onClick={() => { setEditingBrand(null); setIsSheetOpen(true); }} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        Add Brand
                    </Button>
                    <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
                        <SheetHeader className="px-6 pt-6 pb-4">
                            <SheetTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</SheetTitle>
                            <SheetDescription>
                                {editingBrand ? 'Update the brand details below.' : 'Fill in the details to add a new brand.'}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <BrandForm
                                brand={editingBrand}
                                onSuccess={handleSuccess}
                                onClose={handleClose}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Stats */}
            <Card>
                <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Total brands: <span className="font-semibold text-foreground">{brands.length}</span>
                    </p>
                </CardContent>
            </Card>

            {/* Brands Grid */}
            {brands.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                        <Tag className="h-10 w-10 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No brands yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                            Add your first brand to start linking it to device models.
                        </p>
                        <Button onClick={() => setIsSheetOpen(true)} className="mt-2 gap-2">
                            <Plus className="h-4 w-4" />
                            Add First Brand
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {brands.map((brand) => {
                        const imageUrl = getImageUrl(brand.image);
                        const initial = brand.name.charAt(0).toUpperCase();
                        return (
                            <Card key={brand._id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                {/* Brand image or initial */}
                                <div className="h-28 bg-muted flex items-center justify-center">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={brand.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-contain p-3"
                                        />
                                    ) : (
                                        <span className="text-5xl font-bold text-muted-foreground/40">{initial}</span>
                                    )}
                                </div>
                                <CardHeader className="p-3 pb-0">
                                    <CardTitle className="text-sm font-semibold truncate">{brand.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-2">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-8 text-xs"
                                            onClick={() => handleEdit(brand)}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 h-8 text-xs"
                                            onClick={() => handleDeleteClick(brand)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                title="Delete Brand"
                description={`Are you sure you want to delete "${brandToDelete?.name}"? Models linked to this brand will lose their brand association.`}
            />
        </div>
    );
};

export default Brands;
