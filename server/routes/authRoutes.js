import express from 'express';
import {
  register,
  login,
  forgotPassword,
  getMe
} from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation
} from '../validations/authValidation.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerValidation), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginValidation), login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Reset password using secret code
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', auth, getMe);

export default router;

