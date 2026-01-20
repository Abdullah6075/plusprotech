import Joi from 'joi';

/**
 * Validation schemas for service endpoints
 * Uses Joi for request validation
 */

/**
 * Create service validation schema
 */
export const createServiceValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters',
      'string.max': 'Service name cannot exceed 50 characters',
      'any.required': 'Service name is required'
    })
});

/**
 * Update service validation schema
 */
export const updateServiceValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Service name must be at least 2 characters',
      'string.max': 'Service name cannot exceed 50 characters'
    })
});
