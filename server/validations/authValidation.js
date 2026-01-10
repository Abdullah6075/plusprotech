import Joi from 'joi';

/**
 * Validation schemas for authentication endpoints
 * Uses Joi for request validation
 */

/**
 * Register validation schema
 * Validates user registration data
 */
export const registerValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),

  contactNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Contact number is required',
      'string.pattern.base': 'Please enter a valid contact number (10-15 digits)',
      'any.required': 'Contact number is required'
    }),

  contactEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Contact email is required',
      'string.email': 'Please enter a valid contact email',
      'any.required': 'Contact email is required'
    }),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),

  secretCode: Joi.string()
    .min(4)
    .max(20)
    .trim()
    .required()
    .messages({
      'string.empty': 'Secret code is required',
      'string.min': 'Secret code must be at least 4 characters',
      'string.max': 'Secret code cannot exceed 20 characters',
      'any.required': 'Secret code is required'
    })
});

/**
 * Login validation schema
 * Validates user login credentials
 */
export const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

/**
 * Forgot password validation schema
 * Validates email and secret code for password reset
 */
export const forgotPasswordValidation = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),

  secretCode: Joi.string()
    .trim()
    .min(4)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Secret code is required',
      'string.min': 'Secret code must be at least 4 characters',
      'string.max': 'Secret code cannot exceed 20 characters',
      'any.required': 'Secret code is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required'
    })
});

