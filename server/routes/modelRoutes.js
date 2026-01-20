import express from 'express';
import {
  createModel,
  getAllModels,
  getModelById,
  updateModel,
  deleteModel
} from '../controllers/modelController.js';
import { uploadModelImage } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  createModelValidation,
  updateModelValidation
} from '../validations/modelValidation.js';
// import auth from '../middlewares/auth.js'; // Uncomment when you want to protect routes

const router = express.Router();

/**
 * @route   POST /api/models
 * @desc    Create a new model
 * @access  Private (add auth middleware when ready)
 */
router.post(
  '/',
  // auth, // Uncomment to protect route
  uploadModelImage,
  validate(createModelValidation),
  createModel
);

/**
 * @route   GET /api/models/:id
 * @desc    Get single model by ID
 * @access  Public
 */
router.get('/:id', getModelById);

/**
 * @route   GET /api/models
 * @desc    Get all models
 * @access  Public
 */
router.get('/', getAllModels);

/**
 * @route   PUT /api/models/:id
 * @desc    Update model
 * @access  Private (add auth middleware when ready)
 */
router.put(
  '/:id',
  // auth, // Uncomment to protect route
  uploadModelImage,
  validate(updateModelValidation),
  updateModel
);

/**
 * @route   DELETE /api/models/:id
 * @desc    Delete model
 * @access  Private (add auth middleware when ready)
 */
router.delete(
  '/:id',
  // auth, // Uncomment to protect route
  deleteModel
);

export default router;
