import React, { useState, useEffect, useRef } from 'react';
import { useGetModelServicesQuery, useDeleteModelServiceMutation } from '../services/modelServiceApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import { useGetBrandsByCategoryQuery } from '../services/brandApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Package, Search, X } from 'lucide-react';
import ModelServiceForm from '../components/ModelServiceForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import PaginationControls from '../components/PaginationControls';

/**
 * ModelServices Page
 * Displays all model services in cards with edit/delete options
 */
const ModelServices = () => {
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

  const { data, isLoading, error } = useGetModelServicesQuery(queryParams);
  const [deleteModelService, { isLoading: isDeleting }] = useDeleteModelServiceMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingModelService, setEditingModelService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelServiceToDelete, setModelServiceToDelete] = useState(null);

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

  const handleEdit = (modelService) => {
    setEditingModelService(modelService);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (modelService) => {
    setModelServiceToDelete(modelService);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modelServiceToDelete) return;

    try {
      await deleteModelService(modelServiceToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setModelServiceToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete model service');
    }
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setEditingModelService(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setEditingModelService(null);
    // Reset to first page after creating/updating
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const modelServices = data?.data?.modelServices || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Model Services</h1>
          <p className="text-muted-foreground">Manage services for specific models</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingModelService(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Model Service
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>
                {editingModelService ? 'Edit Model Service' : 'Add New Model Service'}
              </SheetTitle>
              <SheetDescription>
                {editingModelService 
                  ? 'Update the model service details below.' 
                  : 'Fill in the details to create a new model service.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <ModelServiceForm
                key={editingModelService?._id ?? 'new'}
                modelService={editingModelService}
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
            placeholder="Search services…"
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
            {pagination.totalItems} service{pagination.totalItems !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Model Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
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
            <CardDescription>Failed to load model services. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      ) : modelServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {search
                ? `No results for "${search}"`
                : hasActiveFilters
                  ? 'No services match the selected filters'
                  : 'No model services found'}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {search
                ? 'Try a different search term or clear the filters.'
                : hasActiveFilters
                  ? 'Try a different category or brand combination.'
                  : 'Get started by creating your first model service'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            ) : (
              <Button variant="outline" className="mt-4" onClick={() => setIsSheetOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Model Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelServices.map((modelService) => (
            <Card key={modelService._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{modelService.name}</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Model:</span>
                    <Badge variant="outline">
                      {modelService.modelId?.name || 'N/A'}
                    </Badge>
                    {modelService.modelId?.categoryId && (
                      <Badge variant="secondary" className="text-xs">
                        {modelService.modelId.categoryId?.name || modelService.modelId.categoryId}
                      </Badge>
                    )}
                    {modelService.modelId?.brandId && (
                      <Badge variant="secondary" className="text-xs">
                        {modelService.modelId.brandId?.name || modelService.modelId.brandId}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Service:</span>
                    <Badge variant="outline">
                      {modelService.serviceId?.name || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="text-lg font-semibold">${modelService.price.toFixed(2)}</span>
                  </div>
                  {modelService.discountedPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Discounted:</span>
                      <span className="text-lg font-semibold text-primary">
                        ${modelService.discountedPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(modelService)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(modelService)}
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
        title="Delete Model Service"
        description="Are you sure you want to delete this model service? This action cannot be undone."
        itemName={modelServiceToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ModelServices;
