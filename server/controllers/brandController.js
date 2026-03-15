import Brand from '../models/Brand.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST /api/brands
export const createBrand = async (req, res, next) => {
  try {
    const { name, categories } = req.body;

    const existing = await Brand.findOne({ name: name.trim() });
    if (existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Brand with this name already exists' });
    }

    // categories may arrive as a JSON string or an array
    let parsedCategories = [];
    if (categories) {
      parsedCategories = Array.isArray(categories)
        ? categories
        : JSON.parse(categories);
    }

    const brand = await Brand.create({
      name: name.trim(),
      image: req.file ? `/uploads/brands/${req.file.filename}` : null,
      categories: parsedCategories,
    });

    await brand.populate('categories', 'name');

    res.status(201).json({ success: true, message: 'Brand created successfully', data: { brand } });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// GET /api/brands
export const getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find()
      .populate('categories', 'name')
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: { brands } });
  } catch (error) {
    next(error);
  }
};

// GET /api/brands/:id
export const getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id).populate('categories', 'name');
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    res.status(200).json({ success: true, data: { brand } });
  } catch (error) {
    next(error);
  }
};

// GET /api/brands/by-category/:categoryId
// Returns brands explicitly registered for this category
export const getBrandsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const brands = await Brand.find({ categories: categoryId })
      .populate('categories', 'name')
      .sort({ name: 1 });

    res.status(200).json({ success: true, data: { brands } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/brands/:id
export const updateBrand = async (req, res, next) => {
  try {
    const { name, categories } = req.body;
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    if (name) {
      const existing = await Brand.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, error: 'Brand with this name already exists' });
      }
      brand.name = name.trim();
    }

    if (categories !== undefined) {
      brand.categories = Array.isArray(categories)
        ? categories
        : JSON.parse(categories);
    }

    if (req.file) {
      if (brand.image) {
        const oldPath = path.join(__dirname, '..', brand.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      brand.image = `/uploads/brands/${req.file.filename}`;
    }

    await brand.save();
    await brand.populate('categories', 'name');

    res.status(200).json({ success: true, message: 'Brand updated successfully', data: { brand } });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// DELETE /api/brands/:id
export const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });

    if (brand.image) {
      const imagePath = path.join(__dirname, '..', brand.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    next(error);
  }
};
