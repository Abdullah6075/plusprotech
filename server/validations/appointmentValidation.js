import Joi from 'joi';

/**
 * Validation schemas for appointment endpoints
 * Uses Joi for request validation
 */

/**
 * Create appointment validation schema
 */
export const createAppointmentValidation = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Appointment title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Appointment title is required'
    }),
  description: Joi.string()
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
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
  contactPhone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Contact phone is required',
      'string.pattern.base': 'Please enter a valid contact number (10-15 digits)',
      'any.required': 'Contact phone is required'
    }),
  contactEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Contact email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Contact email is required'
    }),
  date: Joi.date()
    .required()
    .messages({
      'date.base': 'Appointment date is required',
      'any.required': 'Appointment date is required'
    }),
  time: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Appointment time is required',
      'any.required': 'Appointment time is required'
    }),
  modelId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Model ID is required',
      'any.required': 'Model ID is required'
    }),
  modelServiceId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Model Service ID is required',
      'any.required': 'Model Service ID is required'
    })
});

/**
 * Update appointment validation schema
 */
export const updateAppointmentValidation = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  description: Joi.string()
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  contactPhone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid contact number (10-15 digits)'
    }),
  contactEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  date: Joi.date()
    .messages({
      'date.base': 'Please enter a valid date'
    }),
  time: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Appointment time is required'
    }),
  status: Joi.string()
    .valid('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, in-progress, completed, cancelled'
    })
});
