import express from 'express';
import {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory
} from '../controllers/inventoryController.js';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createInventoryValidation,
  updateInventoryValidation
} from '../validations/inventoryValidation.js';

const router = express.Router();

/**
 * @route   POST /api/inventory
 * @desc    Create a new inventory item
 * @access  Private (Admin)
 */
router.post(
  '/',
  auth,
  validate(createInventoryValidation),
  createInventory
);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get single inventory item by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, getInventoryById);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items
 * @access  Private (Admin)
 */
router.get('/', auth, getAllInventory);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  auth,
  validate(updateInventoryValidation),
  updateInventory
);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  auth,
  deleteInventory
);

export default router;
