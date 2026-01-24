import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetCategoryByIdQuery } from '../services/categoryApi';
import { useGetModelsQuery } from '../services/modelApi';
import { useGetModelServicesQuery } from '../services/modelServiceApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Image as ImageIcon, ArrowLeft, Calendar, LogIn } from 'lucide-react';
import ServiceSelectionDialog from '../components/ServiceSelectionDialog';

/**
 * Models By Category Page
 * Shows models for a specific category with Schedule Service functionality
 */
const ModelsByCategory = () => {
  const { categoryId } = useParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: categoryData, isLoading: categoryLoading } = useGetCategoryByIdQuery(categoryId);
  const { data: modelsData, isLoading: modelsLoading } = useGetModelsQuery({ categoryId });
  const [selectedModel, setSelectedModel] = useState(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const category = categoryData?.data?.category;
  const models = modelsData?.data?.models || [];

  const handleScheduleService = (model) => {
    setSelectedModel(model);
    // Show login popup if user is not authenticated
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
    } else {
      // User is authenticated, proceed directly to service selection
      setServiceDialogOpen(true);
    }
  };

  const handleContinueAsGuest = () => {
    setAuthDialogOpen(false);
    // Proceed to service selection as guest
    if (selectedModel) {
      setServiceDialogOpen(true);
    }
  };

  if (categoryLoading || modelsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Category not found</p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-4 mb-4">
          {getImageUrl(category.image) && (
            <img
              src={getImageUrl(category.image)}
              alt={category.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">Select a model to schedule a service</p>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      {models.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No models found</h3>
            <p className="text-sm text-muted-foreground text-center">
              No models available in this category yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <Card key={model._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-muted">
                {getImageUrl(model.image) ? (
                  <img
                    src={getImageUrl(model.image)}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{model.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleScheduleService(model)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Service
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Optional Login Dialog - Show when user clicks Schedule Service and is not logged in */}
      <Dialog open={authDialogOpen && !isAuthenticated} onOpenChange={(open) => {
        if (!open) {
          setAuthDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-primary/10 p-2">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl">Login Optional</DialogTitle>
            </div>
            <DialogDescription className="text-left text-base">
              You can schedule an appointment without logging in, or login to save your information for faster booking next time.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>Benefits of logging in:</strong> Track your appointments, faster booking, and receive updates about your service requests.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleContinueAsGuest}
            >
              Continue as Guest
            </Button>
            <Link to="/login" className="flex-1" onClick={() => setAuthDialogOpen(false)}>
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Register
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Selection Dialog */}
      {selectedModel && (
        <ServiceSelectionDialog
          open={serviceDialogOpen}
          onOpenChange={setServiceDialogOpen}
          model={selectedModel}
        />
      )}
    </div>
  );
};

export default ModelsByCategory;
