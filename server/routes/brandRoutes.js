import express from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  getBrandsByCategory,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { uploadBrandImage } from '../middlewares/upload.js';

const router = express.Router();

// GET /api/brands/by-category/:categoryId — must come before /:id
router.get('/by-category/:categoryId', getBrandsByCategory);

// GET /api/brands
router.get('/', getAllBrands);

// GET /api/brands/:id
router.get('/:id', getBrandById);

// POST /api/brands
router.post('/', uploadBrandImage, createBrand);

// PUT /api/brands/:id
router.put('/:id', uploadBrandImage, updateBrand);

// DELETE /api/brands/:id
router.delete('/:id', deleteBrand);

export default router;
