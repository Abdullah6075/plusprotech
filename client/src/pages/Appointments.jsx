import React from 'react';
import { useGetAppointmentsQuery, useDeleteAppointmentMutation } from '../services/appointmentApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Calendar, Trash2, Package, User, DollarSign, Search, X } from 'lucide-react';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import InvoiceDisplay from '../components/InvoiceDisplay';
import InvoiceButton from '../components/InvoiceButton';
import { useState } from 'react';

/**
 * Appointments Page (Customer View)
 * Shows appointments created by the logged-in customer
 */
const Appointments = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query - wait 500ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useGetAppointmentsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: debouncedSearchQuery.trim() || undefined,
  });
  const [deleteAppointment, { isLoading: isDeleting }] = useDeleteAppointmentMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [invoiceDisplayOpen, setInvoiceDisplayOpen] = useState(false);
  const [appointmentForInvoice, setAppointmentForInvoice] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointment(appointmentToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete appointment');
    }
  };

  const handleViewInvoice = (appointment) => {
    setAppointmentForInvoice(appointment);
    setInvoiceDisplayOpen(true);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed':
        return 'default'; // Blue/primary
      case 'in-progress':
        return 'secondary'; // Gray
      case 'completed':
        return 'default'; // Green (we'll use custom class)
      case 'cancelled':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'confirmed':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'in-progress':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your appointments</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load appointments. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const appointments = data?.data?.appointments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your scheduled appointments</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              You haven't scheduled any appointments yet. Browse categories to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">{appointment.title}</CardTitle>
                  <Badge 
                    variant={getStatusBadgeVariant(appointment.status)}
                    className={`${getStatusBadgeClass(appointment.status)} shrink-0 text-xs`}
                  >
                    {appointment.status}
                  </Badge>
                </div>
                {appointment.description && (
                  <CardDescription className="text-xs sm:text-sm line-clamp-1 mt-1">
                    {appointment.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">Model:</span>
                  </div>
                  <span className="font-medium truncate">{appointment.modelId?.name || 'N/A'}</span>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Service:</span>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit">
                    {appointment.modelServiceId?.name || 'N/A'}
                  </Badge>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Price:</span>
                  </div>
                  <span className="font-semibold">
                    {appointment.modelServiceId?.discountedPrice 
                      ? `$${appointment.modelServiceId.discountedPrice.toFixed(2)}`
                      : `$${appointment.modelServiceId?.price?.toFixed(2) || '0.00'}`
                    }
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Date:</span>
                  </div>
                  <span className="font-medium text-xs">
                    {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                  </span>
                  
                  <div className="text-muted-foreground">Time:</div>
                  <span className="font-medium text-xs">{appointment.time || 'N/A'}</span>
                </div>
                <div className="space-y-2 mt-3">
                  <InvoiceButton
                    appointment={appointment}
                    onViewInvoice={handleViewInvoice}
                    showForAllStatuses={true}
                  />
                  {appointment.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => handleDeleteClick(appointment)}
                    >
                      <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Cancel
                    </Button>
                  )}
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
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        itemName={appointmentToDelete?.title}
        isLoading={isDeleting}
      />

      {/* Invoice Display Dialog */}
      {appointmentForInvoice && (
        <InvoiceDisplay
          open={invoiceDisplayOpen}
          onOpenChange={setInvoiceDisplayOpen}
          appointment={appointmentForInvoice}
        />
      )}
    </div>
  );
};

export default Appointments;
