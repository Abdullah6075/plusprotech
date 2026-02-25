import Joi from 'joi';

/**
 * Validation schemas for review endpoints
 * Uses Joi for request validation
 */

/**
 * Create review validation schema
 */
export const createReviewValidation = Joi.object({
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
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  review: Joi.string()
    .min(10)
    .max(500)
    .trim()
    .required()
    .messages({
      'string.empty': 'Review text is required',
      'string.min': 'Review must be at least 10 characters',
      'string.max': 'Review cannot exceed 500 characters',
      'any.required': 'Review text is required'
    })
});

/**
 * Update review validation schema
 */
export const updateReviewValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    }),
  review: Joi.string()
    .min(10)
    .max(500)
    .trim()
    .messages({
      'string.min': 'Review must be at least 10 characters',
      'string.max': 'Review cannot exceed 500 characters'
    }),
  showInLandingPage: Joi.boolean()
    .messages({
      'boolean.base': 'showInLandingPage must be a boolean'
    })
});

/**
 * Toggle show in landing page validation schema
 */
export const toggleShowInLandingPageValidation = Joi.object({
  showInLandingPage: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'showInLandingPage must be a boolean',
      'any.required': 'showInLandingPage is required'
    })
});
