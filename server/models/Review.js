import mongoose from 'mongoose';

/**
 * Review Schema
 * Represents a customer review
 */
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer'
      }
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    showInLandingPage: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
