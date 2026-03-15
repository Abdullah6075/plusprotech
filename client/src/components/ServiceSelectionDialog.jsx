import React, { useState } from 'react';
import { useGetModelServicesQuery } from '../services/modelServiceApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogBody } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wrench, DollarSign, Calendar } from 'lucide-react';
import AppointmentForm from './AppointmentForm';

/**
 * Service Selection Dialog
 * Shows all services for a selected model and allows scheduling
 */
const ServiceSelectionDialog = ({ open, onOpenChange, model }) => {
  const { data, isLoading } = useGetModelServicesQuery(
    { modelId: model?._id },
    { skip: !model?._id }
  );
  const [selectedService, setSelectedService] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const modelServices = data?.data?.modelServices || [];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSuccess = () => {
    setShowAppointmentForm(false);
    setSelectedService(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showAppointmentForm} onOpenChange={onOpenChange}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Select a Service for {model?.name}</DialogTitle>
            <DialogDescription>
              Choose a service to schedule an appointment
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : modelServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No services available for this model</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {modelServices.map((service) => (
                <Card key={service._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {service.serviceId?.name || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="text-lg font-semibold">
                            ${service.price.toFixed(2)}
                          </span>
                        </div>
                        {service.discountedPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Discounted:</span>
                            <span className="text-lg font-semibold text-primary">
                              ${service.discountedPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Appointment Form Dialog */}
      {selectedService && (
        <AppointmentForm
          open={showAppointmentForm}
          onOpenChange={setShowAppointmentForm}
          modelService={selectedService}
          model={model}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </>
  );
};

export default ServiceSelectionDialog;
