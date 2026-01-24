import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createAppointmentValidation,
  updateAppointmentValidation
} from '../validations/appointmentValidation.js';

const router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment (can be guest or authenticated user)
 * @access  Public (Optional auth)
 */
router.post(
  '/',
  auth.optional, // Make auth optional
  validate(createAppointmentValidation),
  createAppointment
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment by ID
 * @access  Private
 */
router.get('/:id', auth, getAppointmentById);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (admin sees all, customer sees own)
 * @access  Private
 */
router.get('/', auth, getAllAppointments);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  validate(updateAppointmentValidation),
  updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete appointment
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  deleteAppointment
);

export default router;
