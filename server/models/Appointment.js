import mongoose from 'mongoose';

/**
 * Appointment Schema
 * Represents an appointment scheduled by a customer
 */
const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Appointment title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional - for guest appointments
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please enter a valid contact number']
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid contact email']
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: [true, 'Model ID is required']
    },
    modelServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModelService',
      required: [true, 'Model Service ID is required']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
