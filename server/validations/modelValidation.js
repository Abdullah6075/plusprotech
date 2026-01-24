import Joi from 'joi';

/**
 * Validation schemas for model endpoints
 * Uses Joi for request validation
 */

/**
 * Create model validation schema
 * Note: Image validation is handled by multer middleware
 */
export const createModelValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Model name is required',
      'string.min': 'Model name must be at least 2 characters',
      'string.max': 'Model name cannot exceed 50 characters',
      'any.required': 'Model name is required'
    }),
  categoryId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Category ID is required',
      'any.required': 'Category ID is required'
    })
});

/**
 * Update model validation schema
 */
export const updateModelValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Model name must be at least 2 characters',
      'string.max': 'Model name cannot exceed 50 characters'
    }),
  categoryId: Joi.string()
    .messages({
      'string.empty': 'Category ID is required'
    })
});
