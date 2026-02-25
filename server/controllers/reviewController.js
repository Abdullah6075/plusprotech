import Review from '../models/Review.js';

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Public
 * 
 * @body    {String} name - Reviewer name
 * @body    {Number} rating - Rating (1-5)
 * @body    {String} review - Review text
 * 
 * @returns {Object} success, message, data: { review }
 */
export const createReview = async (req, res, next) => {
  try {
    const { name, rating, review } = req.body;

    // Create review
    const newReview = await Review.create({
      name: name.trim(),
      rating: parseInt(rating),
      review: review.trim(),
      showInLandingPage: false // Default to false, admin can toggle later
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Public (for landing page) / Private (for admin dashboard)
 * 
 * @query   {Boolean} showInLandingPage - Filter by showInLandingPage flag (optional)
 * 
 * @returns {Object} success, data: { reviews }
 */
export const getAllReviews = async (req, res, next) => {
  try {
    const { showInLandingPage } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (showInLandingPage !== undefined) {
      query.showInLandingPage = showInLandingPage === 'true';
    }

    // Get total count
    const total = await Review.countDocuments(query);

    // Get paginated reviews
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews/:id
 * @desc    Get single review by ID
 * @access  Public
 * 
 * @param   {String} id - Review ID
 * 
 * @returns {Object} success, data: { review }
 */
export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private (Admin only)
 * 
 * @param   {String} id - Review ID
 * @body    {String} name - Reviewer name (optional)
 * @body    {Number} rating - Rating (1-5) (optional)
 * @body    {String} review - Review text (optional)
 * @body    {Boolean} showInLandingPage - Show in landing page flag (optional)
 * 
 * @returns {Object} success, message, data: { review }
 */
export const updateReview = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { name, rating, review, showInLandingPage } = req.body;
    const reviewDoc = await Review.findById(req.params.id);

    if (!reviewDoc) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) {
      reviewDoc.name = name.trim();
    }
    if (rating !== undefined) {
      reviewDoc.rating = parseInt(rating);
    }
    if (review !== undefined) {
      reviewDoc.review = review.trim();
    }
    if (showInLandingPage !== undefined) {
      reviewDoc.showInLandingPage = showInLandingPage;
    }

    await reviewDoc.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: reviewDoc
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/reviews/:id/toggle-landing-page
 * @desc    Toggle showInLandingPage flag
 * @access  Private (Admin only)
 * 
 * @param   {String} id - Review ID
 * @body    {Boolean} showInLandingPage - Show in landing page flag
 * 
 * @returns {Object} success, message, data: { review }
 */
export const toggleShowInLandingPage = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { showInLandingPage } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.showInLandingPage = showInLandingPage;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${showInLandingPage ? 'shown' : 'hidden'} on landing page`,
      data: {
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private (Admin only)
 * 
 * @param   {String} id - Review ID
 * 
 * @returns {Object} success, message
 */
export const deleteReview = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
