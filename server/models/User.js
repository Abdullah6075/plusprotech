import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Represents a user in the mobile repairing company management system
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
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
    email: {
      type: String,
      required: [true, 'Email is required for authentication'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    secretCode: {
      type: String,
      required: [true, 'Secret code is required'],
      select: false // Don't return secret code by default
      // Note: minlength and maxlength are validated in Joi before reaching the model
      // After hashing, the secret code will be 60 characters (bcrypt hash),
      // so we don't validate length here to avoid conflicts with the hashed value
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      required: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

// Hash password and secret code before saving
userSchema.pre('save', async function (next) {
  // Hash password if it has been modified (or is new)
  if (this.isModified('password')) {
    try {
      // Hash password with cost of 12
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Hash secret code if it has been modified (or is new)
  if (this.isModified('secretCode')) {
    try {
      // Validate original secret code length before hashing
      const originalSecretCode = this.secretCode?.trim();
      if (!originalSecretCode || originalSecretCode.length < 4) {
        return next(new Error('Secret code must be at least 4 characters'));
      }
      if (originalSecretCode.length > 20) {
        return next(new Error('Secret code cannot exceed 20 characters'));
      }
      
      // Hash secret code with cost of 12
      const salt = await bcrypt.genSalt(12);
      this.secretCode = await bcrypt.hash(originalSecretCode, salt);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare secret code
userSchema.methods.compareSecretCode = async function (candidateSecretCode) {
  return await bcrypt.compare(candidateSecretCode, this.secretCode);
};

const User = mongoose.model('User', userSchema);

export default User;

