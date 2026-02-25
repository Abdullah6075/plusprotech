import express from 'express';
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  toggleShowInLandingPage,
  deleteReview
} from '../controllers/reviewController.js';
import validate from '../middlewares/validate.js';
import {
  createReviewValidation,
  updateReviewValidation,
  toggleShowInLandingPageValidation
} from '../validations/reviewValidation.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Public
 */
router.post(
  '/',
  validate(createReviewValidation),
  createReview
);

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (filtered by showInLandingPage if query param provided)
 * @access  Public
 */
router.get('/', getAllReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get single review by ID
 * @access  Public
 */
router.get('/:id', getReviewById);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  auth,
  validate(updateReviewValidation),
  updateReview
);

/**
 * @route   PATCH /api/reviews/:id/toggle-landing-page
 * @desc    Toggle showInLandingPage flag
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/toggle-landing-page',
  auth,
  validate(toggleShowInLandingPageValidation),
  toggleShowInLandingPage
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  auth,
  deleteReview
);

export default router;
