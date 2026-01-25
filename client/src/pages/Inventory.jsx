import React, { useState } from 'react';
import { useGetInventoryQuery, useDeleteInventoryMutation } from '../services/inventoryApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import InventoryForm from '../components/InventoryForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

/**
 * Inventory Page
 * Displays all inventory items with edit/delete options
 */
const Inventory = () => {
  const { data, isLoading, error } = useGetInventoryQuery();
  const [deleteInventory, { isLoading: isDeleting }] = useDeleteInventoryMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);

  const handleCreate = () => {
    setEditingInventory(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (inventory) => {
    setEditingInventory(inventory);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (inventory) => {
    setInventoryToDelete(inventory);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!inventoryToDelete) return;

    try {
      await deleteInventory(inventoryToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setInventoryToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete inventory item');
    }
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setEditingInventory(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
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
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage your inventory items</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load inventory. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const inventory = data?.data?.inventory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>
                {editingInventory ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </SheetTitle>
              <SheetDescription>
                {editingInventory ? 'Update the inventory item details below.' : 'Fill in the details to add a new inventory item.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <InventoryForm
                inventory={editingInventory}
                onSuccess={handleSuccess}
                onClose={() => setIsSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Inventory List */}
      {inventory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Get started by adding your first inventory item.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <Card key={item._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-semibold">{item.quantity} {item.unit || 'piece'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(item)}
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
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item? This action cannot be undone."
        itemName={inventoryToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Inventory;
