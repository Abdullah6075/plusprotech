import Joi from 'joi';

/**
 * Validation schemas for category endpoints
 * Uses Joi for request validation
 */

/**
 * Create category validation schema
 * Note: Image validation is handled by multer middleware
 */
export const createCategoryValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name cannot exceed 50 characters',
      'any.required': 'Category name is required'
    })
});

/**
 * Update category validation schema
 */
export const updateCategoryValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name cannot exceed 50 characters'
    })
});

