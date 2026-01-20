import mongoose from 'mongoose';

/**
 * ModelService Schema
 * Represents a service associated with a specific model
 * Links Model and Service with pricing information
 */
const modelServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters'],
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
      validate: {
        validator: function(value) {
          // Discounted price should be less than or equal to regular price
          return !value || value <= this.price;
        },
        message: 'Discounted price must be less than or equal to regular price'
      }
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: [true, 'Model ID is required']
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

// Compound index to ensure unique combination of modelId and serviceId
modelServiceSchema.index({ modelId: 1, serviceId: 1 }, { unique: true });

const ModelService = mongoose.model('ModelService', modelServiceSchema);

export default ModelService;
