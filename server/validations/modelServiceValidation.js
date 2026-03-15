import Joi from 'joi';

/**
 * Validation schemas for modelService endpoints
 * Uses Joi for request validation
 */

/**
 * Create modelService validation schema
 */
export const createModelServiceValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters',
      'string.max': 'Service name cannot exceed 100 characters',
      'any.required': 'Service name is required'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  discountedPrice: Joi.number()
    .min(0)
    .allow(null, '')
    .messages({
      'number.base': 'Discounted price must be a number',
      'number.min': 'Discounted price cannot be negative'
    }),
  modelId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Model ID is required',
      'any.required': 'Model ID is required'
    }),
  serviceId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Service ID is required',
      'any.required': 'Service ID is required'
    })
}).custom((value, helpers) => {
  // Validate that discountedPrice is less than or equal to price
  if (value.discountedPrice && value.discountedPrice > value.price) {
    return helpers.error('custom.discountedPrice');
  }
  return value;
}).messages({
  'custom.discountedPrice': 'Discounted price must be less than or equal to regular price'
});

/**
 * Update modelService validation schema
 */
export const updateModelServiceValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Service name must be at least 2 characters',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
  price: Joi.number()
    .min(0)
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  discountedPrice: Joi.number()
    .min(0)
    .allow(null, '')
    .messages({
      'number.base': 'Discounted price must be a number',
      'number.min': 'Discounted price cannot be negative'
    }),
  modelId: Joi.string()
    .messages({
      'string.empty': 'Model ID is required'
    }),
  serviceId: Joi.string()
    .messages({
      'string.empty': 'Service ID is required'
    })
}).custom((value, helpers) => {
  // Validate that discountedPrice is less than or equal to price
  if (value.discountedPrice && value.price && value.discountedPrice > value.price) {
    return helpers.error('custom.discountedPrice');
  }
  return value;
}).messages({
  'custom.discountedPrice': 'Discounted price must be less than or equal to regular price'
});
