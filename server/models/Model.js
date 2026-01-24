import mongoose from 'mongoose';

/**
 * Model Schema
 * Represents a model in the mobile repairing company management system
 */
const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Model name must be at least 2 characters'],
      maxlength: [50, 'Model name cannot exceed 50 characters']
    },
    image: {
      type: String,
      required: [true, 'Model image is required'],
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Model = mongoose.model('Model', modelSchema);

export default Model;
