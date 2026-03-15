import express from 'express';
import {
  createModelService,
  getAllModelServices,
  getModelServiceById,
  updateModelService,
  deleteModelService
} from '../controllers/modelServiceController.js';
import validate from '../middlewares/validate.js';
import {
  createModelServiceValidation,
  updateModelServiceValidation
} from '../validations/modelServiceValidation.js';
// import auth from '../middlewares/auth.js'; // Uncomment when you want to protect routes

const router = express.Router();

/**
 * @route   POST /api/model-services
 * @desc    Create a new model service
 * @access  Private (add auth middleware when ready)
 */
router.post(
  '/',
  // auth, // Uncomment to protect route
  validate(createModelServiceValidation),
  createModelService
);

/**
 * @route   GET /api/model-services/:id
 * @desc    Get single model service by ID
 * @access  Public
 */
router.get('/:id', getModelServiceById);

/**
 * @route   GET /api/model-services
 * @desc    Get all model services
 * @access  Public
 */
router.get('/', getAllModelServices);

/**
 * @route   PUT /api/model-services/:id
 * @desc    Update model service
 * @access  Private (add auth middleware when ready)
 */
router.put(
  '/:id',
  // auth, // Uncomment to protect route
  validate(updateModelServiceValidation),
  updateModelService
);

/**
 * @route   DELETE /api/model-services/:id
 * @desc    Delete model service
 * @access  Private (add auth middleware when ready)
 */
router.delete(
  '/:id',
  // auth, // Uncomment to protect route
  deleteModelService
);

export default router;
