import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a JSON Web Token for authenticated users
 * 
 * @param {String} userId - User's MongoDB ID
 * @returns {String} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * 
 * @body    {String} name - User's full name
 * @body    {String} contactNumber - User's contact number (10-15 digits)
 * @body    {String} contactEmail - User's contact email
 * @body    {String} email - Email for authentication
 * @body    {String} password - Password (min 6 characters)
 * @body    {String} secretCode - Secret code for password recovery (min 4 characters)
 * 
 * @returns {Object} success, message, data: { user, token }
 */
export const register = async (req, res, next) => {
  try {
    const { name, contactNumber, contactEmail, email, password, secretCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      contactNumber,
      contactEmail,
      email,
      password,
      secretCode
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (excluding password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          contactNumber: user.contactNumber,
          contactEmail: user.contactEmail,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * 
 * @body    {String} email - User's email
 * @body    {String} password - User's password
 * 
 * @returns {Object} success, message, data: { user, token }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          contactNumber: user.contactNumber,
          contactEmail: user.contactEmail,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Reset password using email and secret code
 * @access  Public
 * 
 * @body    {String} email - User's email
 * @body    {String} secretCode - Secret code provided during registration
 * @body    {String} newPassword - New password (min 6 characters)
 * 
 * @returns {Object} success, message
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, secretCode, newPassword } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found with this email'
      });
    }

    // Verify secret code
    if (user.secretCode !== secretCode) {
      return res.status(401).json({
        success: false,
        error: 'Invalid secret code'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires authentication)
 * 
 * @headers Authorization: Bearer <token>
 * 
 * @returns {Object} success, data: { user }
 */
export const getMe = async (req, res, next) => {
  try {
    // User is attached to req by auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          contactNumber: user.contactNumber,
          contactEmail: user.contactEmail,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

