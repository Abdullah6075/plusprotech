import React, { useState } from 'react'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaStar } from "react-icons/fa";
import { Marquee } from "@/components/ui/marquee";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGetReviewsQuery, useCreateReviewMutation } from "@/services/reviewApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const ReviewCard = ({ name, rating, review }) => {
    return (
        <div className="w-sm sm:w-md border border-gray-200 rounded-2xl p-6 shrink-0 mx-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <p className='md:text-lg text-sm tracking-tight'>{name}</p>
                <div className="flex items-center gap-1 text-gray-600 font-semibold">
                    <FaStar className='text-yellow-400' />
                    {rating}
                </div>
            </div>
            <p className='text-sm md:text-md text-gray-700 font-light tracking-tight mt-4'>{review}</p>
        </div>
    );
};

const ReviewsSection = () => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    // Fetch reviews that are shown on landing page
    const { data: reviewsData, isLoading: isLoadingReviews } = useGetReviewsQuery({ 
        showInLandingPage: true 
    });
    const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

    const reviews = reviewsData?.data?.reviews || [];

    const formik = useFormik({
        initialValues: {
            name: '',
            review: '',
            rating: 0,
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name cannot exceed 50 characters')
                .required('Name is required'),
            rating: Yup.number()
                .integer('Rating must be an integer')
                .min(1, 'Please select a rating')
                .max(5, 'Rating cannot exceed 5')
                .required('Rating is required'),
            review: Yup.string()
                .min(10, 'Review must be at least 10 characters')
                .max(500, 'Review cannot exceed 500 characters')
                .required('Review text is required'),
        }),
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                await createReview({
                    name: values.name.trim(),
                    rating: values.rating,
                    review: values.review.trim(),
                }).unwrap();

                setShowSuccessMessage(true);
                formik.resetForm();
                setHoveredRating(0);

                // Close modal after 2 seconds
                setTimeout(() => {
                    setIsReviewModalOpen(false);
                    setShowSuccessMessage(false);
                }, 2000);
            } catch (err) {
                console.error('Error submitting review:', err);
                const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
                if (err?.data?.errors && Array.isArray(err.data.errors)) {
                    err.data.errors.forEach((validationError) => {
                        const fieldName = validationError.field;
                        if (['name', 'rating', 'review'].includes(fieldName)) {
                            setFieldError(fieldName, validationError.message);
                        }
                    });
                } else {
                    setFieldError('review', errorMessage);
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleStarClick = (rating) => {
        formik.setFieldValue('rating', rating);
    };

    const handleStarHover = (rating) => {
        setHoveredRating(rating);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    const handleCloseModal = () => {
        setIsReviewModalOpen(false);
        formik.resetForm();
        setShowSuccessMessage(false);
        setHoveredRating(0);
    };

    return (
        <>
            <section id="reviews" className='flex flex-col justify-center items-center py-36 gap-16'>
                <p className='container text-center md:text-5xl text-3xl tracking-tight'>Our Customer Reviews</p>
                {isLoadingReviews ? (
                    <div className="w-full flex justify-center items-center py-20">
                        <p className="text-muted-foreground">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="w-full flex justify-center items-center py-20">
                        <p className="text-muted-foreground">No reviews to display yet.</p>
                    </div>
                ) : (
                    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                        <Marquee pauseOnHover className="[--duration:10s]">
                            {reviews.map((review) => (
                                <ReviewCard key={review._id} {...review} />
                            ))}
                        </Marquee>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/9 bg-linear-to-r from-background to-transparent"></div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/9 bg-linear-to-l from-background to-transparent"></div>
                    </div>
                )}
                <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className='text-md tracking-tight text-white bg-[#252525] px-6 py-2 rounded-full cursor-pointer hover:bg-[#353535] transition-colors'
                >
                    Write a Review
                </button>
            </section>

            {/* Review Modal */}
            <Dialog open={isReviewModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent size="default" className="max-w-lg w-[95vw] sm:w-full">
                    <DialogHeader>
                        <DialogTitle className="text-2xl tracking-tight">Write a Review</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Share your experience with us. Your feedback helps us improve our services.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogBody>
                        {showSuccessMessage ? (
                            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800 dark:text-green-200">
                                    Thank you! Your review has been submitted successfully. Your review will be displayed soon like this one.
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <form id="review-form" onSubmit={formik.handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="review-name" className="text-sm font-medium">
                                    Your Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="review-name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                    disabled={isSubmitting || showSuccessMessage}
                                    aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
                                />
                                {formik.touched.name && formik.errors.name ? (
                                    <p className="text-sm text-destructive">{formik.errors.name}</p>
                                ) : null}
                            </div>

                            {/* Rating Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Rating <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const displayRating = hoveredRating || formik.values.rating;
                                        const isFilled = star <= displayRating;
                                        
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleStarClick(star)}
                                                onMouseEnter={() => handleStarHover(star)}
                                                onMouseLeave={handleStarLeave}
                                                className="transition-transform hover:scale-110 focus:outline-none rounded-sm"
                                                disabled={isSubmitting || showSuccessMessage}
                                            >
                                                <FaStar
                                                    className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                                                        isFilled
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
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

                            {/* Review Textarea */}
                            <div className="space-y-2">
                                <Label htmlFor="review-text" className="text-sm font-medium">
                                    Your Review <span className="text-destructive">*</span>
                                </Label>
                                <textarea
                                    id="review-text"
                                    name="review"
                                    rows={5}
                                    placeholder="Tell us about your experience..."
                                    value={formik.values.review}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    disabled={isSubmitting || showSuccessMessage}
                                    aria-invalid={formik.touched.review && formik.errors.review ? 'true' : 'false'}
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        {formik.values.review.length} characters
                                    </p>
                                    {formik.touched.review && formik.errors.review ? (
                                        <p className="text-sm text-destructive">{formik.errors.review}</p>
                                    ) : null}
                                </div>
                            </div>
                        </form>
                    </DialogBody>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                            className="w-full sm:w-auto sm:flex-initial"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="review-form"
                            className="w-full sm:w-auto sm:flex-initial bg-[#252525] hover:bg-[#353535] text-white"
                            disabled={isSubmitting || showSuccessMessage}
                            onClick={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : showSuccessMessage ? 'Submitted!' : 'Submit Review'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ReviewsSection