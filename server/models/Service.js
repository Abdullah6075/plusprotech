import mongoose from 'mongoose';

/**
 * Service Schema
 * Represents a service in the mobile repairing company management system
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Service name must be at least 2 characters'],
      maxlength: [50, 'Service name cannot exceed 50 characters']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
