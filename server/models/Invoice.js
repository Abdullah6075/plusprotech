import mongoose from 'mongoose';

/**
 * Invoice Schema
 * Represents an invoice for a completed appointment
 */
const invoiceSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true // One invoice per appointment
    },
    items: [{
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
      }
    }],
    servicePrice: {
      type: Number,
      required: true,
      min: [0, 'Service price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    qrCode: {
      type: String, // QR code data URL or URL
      default: null
    },
    qrCodeUrl: {
      type: String, // URL to appointment page for QR code
      default: null
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
