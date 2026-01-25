import Joi from 'joi';

/**
 * Validation schemas for invoice endpoints
 * Uses Joi for request validation
 */

/**
 * Create invoice validation schema
 */
export const createInvoiceValidation = Joi.object({
  appointmentId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Appointment ID is required',
      'any.required': 'Appointment ID is required'
    }),
  items: Joi.array()
    .items(
      Joi.object({
        inventoryId: Joi.string()
          .required()
          .messages({
            'string.empty': 'Inventory ID is required',
            'any.required': 'Inventory ID is required'
          }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
          })
      })
    )
    .min(0)
    .messages({
      'array.base': 'Items must be an array'
    }),
  totalPrice: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Total price must be a number',
      'number.min': 'Total price cannot be negative',
      'any.required': 'Total price is required'
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    })
});
