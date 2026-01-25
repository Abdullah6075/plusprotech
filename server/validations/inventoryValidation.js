import Joi from 'joi';

/**
 * Validation schemas for inventory endpoints
 * Uses Joi for request validation
 */

/**
 * Create inventory validation schema
 */
export const createInventoryValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Inventory item name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Inventory item name is required'
    }),
  description: Joi.string()
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required'
    }),
  unit: Joi.string()
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Unit cannot exceed 50 characters'
    })
});

/**
 * Update inventory validation schema
 */
export const updateInventoryValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  price: Joi.number()
    .min(0)
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  quantity: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity cannot be negative'
    }),
  unit: Joi.string()
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Unit cannot exceed 50 characters'
    })
});
