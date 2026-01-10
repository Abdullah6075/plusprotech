import mongoose from 'mongoose';

/**
 * Category Schema
 * Represents a category in the mobile repairing company management system
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    image: {
      type: String,
      required: [true, 'Category image is required'],
      trim: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;

