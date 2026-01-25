import mongoose from 'mongoose';

/**
 * Inventory Schema
 * Represents inventory items used for repairs
 */
const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Inventory item name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    unit: {
      type: String,
      trim: true,
      default: 'piece'
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
