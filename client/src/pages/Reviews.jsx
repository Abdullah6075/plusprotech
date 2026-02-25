import React, { useState } from 'react';
import { 
  useGetReviewsQuery, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useToggleShowInLandingPageMutation
} from '../services/reviewApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Switch } from '../components/ui/switch';
import { Edit, Trash2, Star, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { FaStar } from 'react-icons/fa';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import PaginationControls from '../components/PaginationControls';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/**
 * Reviews Page
 * Displays all reviews with edit/delete/toggle options for admin
 */
const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { data, isLoading, error } = useGetReviewsQuery({ 
    page: currentPage, 
    limit: itemsPerPage 
  });
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [toggleShowInLandingPage] = useToggleShowInLandingPageMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      rating: 0,
      review: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .required('Name is required'),
      rating: Yup.number()
        .integer('Rating must be an integer')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .required('Rating is required'),
      review: Yup.string()
        .min(10, 'Review must be at least 10 characters')
        .max(500, 'Review cannot exceed 500 characters')
        .required('Review text is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        if (editingReview) {
          await updateReview({
            id: editingReview._id,
            ...values,
          }).unwrap();
        }
        setIsSheetOpen(false);
        setEditingReview(null);
        formik.resetForm();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'rating', 'review'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          setFieldError('name', errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEdit = (review) => {
    setEditingReview(review);
    formik.setValues({
      name: review.name,
      rating: review.rating,
      review: review.review,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview(reviewToDelete._id).unwrap();
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.data?.error || 'Failed to delete review');
    }
  };

  const handleToggleShowInLandingPage = async (review) => {
    try {
      await toggleShowInLandingPage({
        id: review._id,
        showInLandingPage: !review.showInLandingPage,
      }).unwrap();
    } catch (err) {
      console.error('Toggle error:', err);
      alert(err?.data?.error || 'Failed to update review');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setEditingReview(null);
    formik.resetForm();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2 mt-4">
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
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load reviews. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage customer reviews</p>
        </div>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-3 mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Reviews will appear here once customers submit them
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{review.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="text-sm font-semibold">{review.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={review.showInLandingPage}
                    onCheckedChange={() => handleToggleShowInLandingPage(review)}
                  />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {review.showInLandingPage ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Showing on landing page
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Hidden from landing page
                      </>
                    )}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {review.review}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(review)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(review)}
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

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Edit Review</SheetTitle>
            <SheetDescription>
              Update the review details below.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  type="text"
                  placeholder="Enter reviewer name"
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
                <Label>Rating <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => formik.setFieldValue('rating', star)}
                      className="transition-transform hover:scale-110 focus:outline-none rounded-sm"
                    >
                      <FaStar
                        className={`h-8 w-8 transition-colors ${
                          star <= formik.values.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {formik.values.rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formik.values.rating} {formik.values.rating === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
                {formik.touched.rating && formik.errors.rating ? (
                  <p className="text-sm text-destructive">{formik.errors.rating}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-review">
                  Review <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="edit-review"
                  name="review"
                  rows={5}
                  placeholder="Enter review text"
                  value={formik.values.review}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                {formik.touched.review && formik.errors.review ? (
                  <p className="text-sm text-destructive">{formik.errors.review}</p>
                ) : null}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        itemName={reviewToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Reviews;
