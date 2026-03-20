import React, { useState, useEffect, useRef } from 'react';
import { useGetModelsQuery, useDeleteModelMutation } from '../services/modelApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import { useGetBrandsByCategoryQuery } from '../services/brandApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Edit, Trash2, Image as ImageIcon, X, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import ModelForm from '../components/ModelForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import PaginationControls from '../components/PaginationControls';
import { getImageUrl } from '../lib/utils';

/**
 * Models Page
 * Displays all models in cards with edit/delete options
 */
const Models = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterBrandId, setFilterBrandId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 1000 });
  const { data: brandsData } = useGetBrandsByCategoryQuery(filterCategoryId, {
    skip: !filterCategoryId,
  });

  const categories = categoriesData?.data?.categories || [];
  const brands = brandsData?.data?.brands || [];

  const queryParams = { page: currentPage, limit: itemsPerPage };
  if (filterCategoryId) queryParams.categoryId = filterCategoryId;
  if (filterBrandId) queryParams.brandId = filterBrandId;
  if (search) queryParams.search = search;

  const { data, isLoading, error } = useGetModelsQuery(queryParams);
  const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  const handleCategoryFilter = (value) => {
    setFilterCategoryId(value === 'all' ? '' : value);
    setFilterBrandId('');
    setCurrentPage(1);
  };

  const handleBrandFilter = (value) => {
    setFilterBrandId(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterCategoryId('');
    setFilterBrandId('');
    setSearchInput('');
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterCategoryId || filterBrandId || search;

  const handleEdit = (model) => {
    setEditingModel(model);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (model) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return;

    try {
      await deleteModel(modelToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete model');
    }
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setEditingModel(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setEditingModel(null);
    // Reset to first page after creating/updating
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const models = data?.data?.models || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">Manage your product models</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingModel(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Model
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </SheetTitle>
              <SheetDescription>
                {editingModel 
                  ? 'Update the model details below.' 
                  : 'Fill in the details to create a new model.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <ModelForm
                key={editingModel?._id ?? 'new'}
                model={editingModel}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterCategoryId || 'all'} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterBrandId || 'all'}
          onValueChange={handleBrandFilter}
          disabled={!filterCategoryId}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={filterCategoryId ? 'All Brands' : 'Select category first'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand._id} value={brand._id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search models…"
            className="h-9 w-52 rounded-md border border-input bg-background pl-8 pr-7 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}

        {pagination.totalItems !== undefined && (
          <span className="ml-auto text-sm text-muted-foreground">
            {pagination.totalItems} model{pagination.totalItems !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Models Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load models. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      ) : models.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {search
                ? `No results for "${search}"`
                : hasActiveFilters
                  ? 'No models match the selected filters'
                  : 'No models found'}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {search
                ? 'Try a different search term or clear the filters.'
                : hasActiveFilters
                  ? 'Try a different category or brand combination.'
                  : 'Get started by creating your first model'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            ) : (
              <Button variant="outline" className="mt-4" onClick={() => setIsSheetOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Model
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <Card key={model._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-white flex items-center justify-center border-b">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                {getImageUrl(model.image) && (
                  <img
                    src={getImageUrl(model.image)}
                    alt={model.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain p-3"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {model.categoryId && (
                    <Badge variant="outline">
                      {model.categoryId?.name || 'N/A'}
                    </Badge>
                  )}
                  {model.brandId && (
                    <Badge variant="secondary">
                      {model.brandId?.name || 'N/A'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(model)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(model)}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationControls
          currentPage={pagination.currentPage || currentPage}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.totalItems || 0}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Model"
        description="Are you sure you want to delete this model? This action cannot be undone and will permanently remove the model and its image."
        itemName={modelToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Models;
