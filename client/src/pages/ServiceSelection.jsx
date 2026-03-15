import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetModelServicesQuery } from '../services/modelServiceApi';
import { useGetModelByIdQuery } from '../services/modelApi';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Wrench, DollarSign, Calendar, ArrowLeft } from 'lucide-react';

/**
 * Service Selection Page
 * Shows all services for a selected model and allows scheduling
 */
const ServiceSelection = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryId = searchParams.get('categoryId');
  const { data, isLoading } = useGetModelServicesQuery(
    { modelId },
    { skip: !modelId }
  );
  const { data: modelData } = useGetModelByIdQuery(modelId, { skip: !modelId });

  const modelServices = data?.data?.modelServices || [];
  const model = modelData?.data?.model;

  const handleServiceSelect = (service) => {
    navigate(`/schedule-appointment/${service._id}/${modelId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link 
        to={`/category/${categoryId || model?.categoryId?._id || model?.categoryId}`} 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Models
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Select a Service for {model?.name || 'Model'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose a service to schedule an appointment
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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
      </div>
    </div>
  );
};

export default ServiceSelection;
