import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { uploadCategoryImage } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import {
  createCategoryValidation,
  updateCategoryValidation
} from '../validations/categoryValidation.js';
// import auth from '../middlewares/auth.js'; // Uncomment when you want to protect routes

const router = express.Router();

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (add auth middleware when ready)
 */
router.post(
  '/',
  // auth, // Uncomment to protect route
  uploadCategoryImage,
  validate(createCategoryValidation),
  createCategory
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get('/:id', getCategoryById);

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getAllCategories);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (add auth middleware when ready)
 */
router.put(
  '/:id',
  // auth, // Uncomment to protect route
  uploadCategoryImage,
  validate(updateCategoryValidation),
  updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (add auth middleware when ready)
 */
router.delete(
  '/:id',
  // auth, // Uncomment to protect route
  deleteCategory
);

export default router;

