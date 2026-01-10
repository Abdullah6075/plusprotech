import React, { useState } from 'react';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '../services/categoryApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import CategoryForm from '../components/CategoryForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

/**
 * Categories Page
 * Displays all categories in cards with edit/delete options
 */
const Categories = () => {
  const { data, isLoading, error } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      // Error will be handled by the dialog or can show a toast notification
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete category');
    }
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setEditingCategory(null);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setEditingCategory(null);
  };

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL.replace('/api', '')}${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading categories</p>
        </div>
      </div>
    );
  }

  const categories = data?.data?.categories || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </SheetTitle>
            </SheetHeader>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No categories found</p>
            <p className="text-sm text-gray-400">Add your first category to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100">
                {getImageUrl(category.image) ? (
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone and will permanently remove the category and its image."
        itemName={categoryToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Categories;

