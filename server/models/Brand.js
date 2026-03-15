import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Brand name must be at least 2 characters'],
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
