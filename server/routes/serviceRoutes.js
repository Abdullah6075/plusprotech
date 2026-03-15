import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import validate from '../middlewares/validate.js';
import {
  createServiceValidation,
  updateServiceValidation
} from '../validations/serviceValidation.js';
// import auth from '../middlewares/auth.js'; // Uncomment when you want to protect routes

const router = express.Router();

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (add auth middleware when ready)
 */
router.post(
  '/',
  // auth, // Uncomment to protect route
  validate(createServiceValidation),
  createService
);

/**
 * @route   GET /api/services/:id
 * @desc    Get single service by ID
 * @access  Public
 */
router.get('/:id', getServiceById);

/**
 * @route   GET /api/services
 * @desc    Get all services
 * @access  Public
 */
router.get('/', getAllServices);

/**
 * @route   PUT /api/services/:id
 * @desc    Update service
 * @access  Private (add auth middleware when ready)
 */
router.put(
  '/:id',
  // auth, // Uncomment to protect route
  validate(updateServiceValidation),
  updateService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service
 * @access  Private (add auth middleware when ready)
 */
router.delete(
  '/:id',
  // auth, // Uncomment to protect route
  deleteService
);

export default router;
