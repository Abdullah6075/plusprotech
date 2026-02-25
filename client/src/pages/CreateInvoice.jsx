import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetInventoryQuery } from '../services/inventoryApi';
import { useCreateInvoiceMutation } from '../services/invoiceApi';
import { useGetAppointmentByIdQuery } from '../services/appointmentApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

/**
 * Create Invoice Page
 * Allows admin to select inventory items and create invoice for completed appointment
 */
const CreateInvoice = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { data: appointmentData } = useGetAppointmentByIdQuery(appointmentId, { skip: !appointmentId });
  const { data: inventoryData } = useGetInventoryQuery();
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const [selectedItems, setSelectedItems] = useState([]); // [{ inventoryId, quantity }]
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const appointment = appointmentData?.data?.appointment;
  const inventory = inventoryData?.data?.inventory || [];

  useEffect(() => {
    if (appointment) {
      // Prefill total price with service cost
      const servicePrice = appointment?.modelServiceId?.discountedPrice || appointment?.modelServiceId?.price || 0;
      setTotalPrice(servicePrice);
    }
  }, [appointment]);

  const handleItemToggle = (item) => {
    const exists = selectedItems.find(si => si.inventoryId === item._id);
    if (exists) {
      setSelectedItems(selectedItems.filter(si => si.inventoryId !== item._id));
    } else {
      setSelectedItems([...selectedItems, { inventoryId: item._id, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (inventoryId, quantity) => {
    if (quantity < 1) return;
    const item = inventory.find(i => i._id === inventoryId);
    if (quantity > item.quantity) {
      alert(`Only ${item.quantity} available`);
      return;
    }
    setSelectedItems(selectedItems.map(si => 
      si.inventoryId === inventoryId ? { ...si, quantity } : si
    ));
  };

  const calculateTotals = () => {
    // Total price is editable by admin, defaults to service price
    const servicePrice = appointment?.modelServiceId?.discountedPrice || appointment?.modelServiceId?.price || 0;
    const total = totalPrice || servicePrice; // Use editable total price or default to service price
    return { servicePrice, total };
  };

  const handleSubmit = async () => {
    if (totalPrice <= 0) {
      alert('Please enter a valid total price');
      return;
    }

    try {
      await createInvoice({
        appointmentId: appointment._id,
        items: selectedItems.length > 0 ? selectedItems.map(si => ({
          inventoryId: si.inventoryId,
          quantity: si.quantity
        })) : [],
        totalPrice: parseFloat(totalPrice),
        description: description.trim() || undefined,
      }).unwrap();
      
      setShowSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/admin-appointments');
      }, 2000);
    } catch (err) {
      alert(err?.data?.error || 'Failed to create invoice');
    }
  };

  const { servicePrice, total } = calculateTotals();

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex flex-col items-center text-center space-y-4 py-12">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Invoice Created Successfully!</h1>
          <p className="text-muted-foreground">
            The invoice has been created and is ready to view.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/dashboard/admin-appointments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Appointments
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground mt-2">
            Select inventory items used for this repair (optional - some repairs may not need items)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Inventory Items Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Items (Optional)</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inventory items available</p>
              ) : (
                inventory.map((item) => {
                  const isSelected = selectedItems.find(si => si.inventoryId === item._id);
                  const selectedQty = isSelected?.quantity || 0;
                  
                  return (
                    <Card key={item._id} className={isSelected ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={!!isSelected}
                            onCheckedChange={() => handleItemToggle(item)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="font-medium cursor-pointer" onClick={() => handleItemToggle(item)}>
                                {item.name}
                              </Label>
                              <span className="text-sm font-semibold">${item.price.toFixed(2)}</span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                               <span className="text-xs text-muted-foreground">
                                 Available: {item.quantity} {item.unit || 'piece'}
                               </span>
                               {isSelected && (
                                 <div className="flex items-center gap-2">
                                   <Button
                                     type="button"
                                     variant="outline"
                                     size="sm"
                                     className="h-7 w-7 p-0"
                                     onClick={() => handleQuantityChange(item._id, selectedQty - 1)}
                                     disabled={selectedQty <= 1}
                                   >
                                     <Minus className="h-3 w-3" />
                                   </Button>
                                   <Input
                                     type="number"
                                     min="1"
                                     max={item.quantity}
                                     value={selectedQty}
                                     onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                     className="w-16 h-7 text-center text-sm"
                                   />
                                   <Button
                                     type="button"
                                     variant="outline"
                                     size="sm"
                                     className="h-7 w-7 p-0"
                                     onClick={() => handleQuantityChange(item._id, selectedQty + 1)}
                                     disabled={selectedQty >= item.quantity}
                                   >
                                     <Plus className="h-3 w-3" />
                                   </Button>
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Invoice Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Preview</h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Appointment Details */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold mb-2">Appointment Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{appointment?.name || appointment?.customerId?.name || 'Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{appointment?.modelId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <Badge variant="outline">{appointment?.modelServiceId?.name || 'N/A'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Items */}
                <div className="border-b pb-3">
                  <h4 className="font-semibold mb-2">Items Used (for tracking only)</h4>
                  {selectedItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map((si) => {
                        const item = inventory.find(i => i._id === si.inventoryId);
                        if (!item) return null;
                        return (
                          <div key={si.inventoryId} className="flex justify-between text-sm">
                            <span>
                              {item.name} x {si.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                 {/* Totals */}
                 <div className="space-y-2 pt-2 border-t">
                   <div className="space-y-1">
                     <Label htmlFor="total-price" className="text-sm font-semibold">
                       Total Price <span className="text-destructive">*</span>
                     </Label>
                     <Input
                       id="total-price"
                       type="number"
                       step="0.01"
                       min="0"
                       value={totalPrice}
                       onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                       className="text-lg font-semibold"
                       placeholder="Enter total price"
                     />
                     <p className="text-xs text-muted-foreground">
                       Default: ${servicePrice.toFixed(2)} (Service Price)
                     </p>
                     <p className="text-xs text-muted-foreground">
                       * This price is only for this invoice and does not change the service price
                     </p>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="invoice-description">Description (Optional)</Label>
              <textarea
                id="invoice-description"
                rows={3}
                placeholder="Add any additional notes or messages for the customer..."
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-initial"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 sm:flex-initial"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
