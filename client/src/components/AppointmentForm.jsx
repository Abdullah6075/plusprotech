import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { useCreateAppointmentMutation } from '../services/appointmentApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { DollarSign, CheckCircle2 } from 'lucide-react';

/**
 * Appointment Form Dialog
 * Creates an appointment for a selected model service
 */
const AppointmentForm = ({ open, onOpenChange, modelService, model, onSuccess }) => {
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const user = useSelector(selectCurrentUser);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Get current date and time for min values
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      name: user?.name || '',
      contactPhone: user?.contactNumber || '',
      contactEmail: user?.contactEmail || user?.email || '',
      date: '',
      time: '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .required('Title is required'),
      description: Yup.string()
        .max(500, 'Description cannot exceed 500 characters'),
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .required('Name is required'),
      contactPhone: Yup.string()
        .matches(/^[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)')
        .required('Contact phone is required'),
      contactEmail: Yup.string()
        .email('Please enter a valid email address')
        .required('Contact email is required'),
      date: Yup.date()
        .required('Appointment date is required')
        .min(today, 'Appointment date cannot be in the past'),
      time: Yup.string()
        .required('Appointment time is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await createAppointment({
          title: values.title.trim(),
          description: values.description.trim() || undefined,
          name: values.name.trim(),
          contactPhone: values.contactPhone.trim(),
          contactEmail: values.contactEmail.trim(),
          date: values.date,
          time: values.time,
          modelServiceId: modelService._id,
          modelId: model._id,
        }).unwrap();

        formik.resetForm();
        setShowSuccess(true);
        // Auto close after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
        }, 3000);
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['title', 'description', 'name', 'contactPhone', 'contactEmail', 'date', 'time'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          setFieldError('title', errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setShowSuccess(false);
    } else {
      // Pre-fill user data if logged in
      if (user) {
        formik.setValues({
          title: '',
          description: '',
          name: user.name || '',
          contactPhone: user.contactNumber || '',
          contactEmail: user.contactEmail || user.email || '',
          date: '',
          time: '',
        });
      }
    }
  }, [open, user]);

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl">Appointment Created Successfully!</DialogTitle>
              <DialogDescription className="text-base">
                Your appointment has been created and confirmed. Please visit us on the scheduled date and time.
              </DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Service:</span>
                  <Badge variant="outline">{modelService?.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <span className="font-medium">{model?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <div className="flex items-center gap-2">
                    {modelService?.discountedPrice ? (
                      <>
                        <span className="text-sm line-through text-muted-foreground">
                          ${modelService.price.toFixed(2)}
                        </span>
                        <span className="font-semibold text-primary">
                          ${modelService.discountedPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">
                        ${modelService?.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-sm text-destructive">{formik.errors.name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  Contact Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formik.values.contactPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.contactPhone && formik.errors.contactPhone ? 'true' : 'false'}
                />
                {formik.touched.contactPhone && formik.errors.contactPhone ? (
                  <p className="text-sm text-destructive">{formik.errors.contactPhone}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Contact Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={formik.values.contactEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.contactEmail && formik.errors.contactEmail ? 'true' : 'false'}
                />
                {formik.touched.contactEmail && formik.errors.contactEmail ? (
                  <p className="text-sm text-destructive">{formik.errors.contactEmail}</p>
                ) : null}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Appointment Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">
                  Appointment Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Screen Repair for iPhone 12"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.title && formik.errors.title ? 'true' : 'false'}
                />
                {formik.touched.title && formik.errors.title ? (
                  <p className="text-sm text-destructive">{formik.errors.title}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    min={today}
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.date && formik.errors.date ? 'true' : 'false'}
                  />
                  {formik.touched.date && formik.errors.date ? (
                    <p className="text-sm text-destructive">{formik.errors.date}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formik.values.time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.time && formik.errors.time ? 'true' : 'false'}
                  />
                  {formik.touched.time && formik.errors.time ? (
                    <p className="text-sm text-destructive">{formik.errors.time}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description (Optional)
                </Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Add any additional details or notes..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.description && formik.errors.description ? 'true' : 'false'}
                />
                {formik.touched.description && formik.errors.description ? (
                  <p className="text-sm text-destructive">{formik.errors.description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || formik.isSubmitting}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </>
                ) : (
                  'Schedule Appointment'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
