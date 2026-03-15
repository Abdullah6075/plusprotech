import React, { useState } from 'react';
import { useGetServicesQuery, useDeleteServiceMutation } from '../services/serviceApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';
import ServiceForm from '../components/ServiceForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import PaginationControls from '../components/PaginationControls';

/**
 * Services Page
 * Displays all services in cards with edit/delete options
 */
const Services = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { data, isLoading, error } = useGetServicesQuery({ 
    page: currentPage, 
    limit: itemsPerPage 
  });
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const handleEdit = (service) => {
    setEditingService(service);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete service');
    }
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setEditingService(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setEditingService(null);
    // Reset to first page after creating/updating
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
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
            <CardDescription>Failed to load services. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const services = data?.data?.services || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your services</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingService(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Service
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </SheetTitle>
              <SheetDescription>
                {editingService 
                  ? 'Update the service details below.' 
                  : 'Fill in the details to create a new service.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <ServiceForm
                service={editingService}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Wrench className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Get started by creating your first service
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(service)}
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
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        itemName={serviceToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Services;
