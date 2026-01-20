import React, { useState } from 'react';
import { useGetModelServicesQuery, useDeleteModelServiceMutation } from '../services/modelServiceApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import ModelServiceForm from '../components/ModelServiceForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

/**
 * ModelServices Page
 * Displays all model services in cards with edit/delete options
 */
const ModelServices = () => {
  const { data, isLoading, error } = useGetModelServicesQuery();
  const [deleteModelService, { isLoading: isDeleting }] = useDeleteModelServiceMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingModelService, setEditingModelService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelServiceToDelete, setModelServiceToDelete] = useState(null);

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

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setEditingModelService(null);
  };

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL.replace('/api', '')}${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load model services. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const modelServices = data?.data?.modelServices || [];

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
                modelService={editingModelService}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Model Services Grid */}
      {modelServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No model services found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Get started by creating your first model service
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Model Service
            </Button>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Model:</span>
                    <Badge variant="outline">
                      {modelService.modelId?.name || 'N/A'}
                    </Badge>
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
