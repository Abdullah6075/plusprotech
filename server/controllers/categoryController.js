import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin only - can be added later)
 * 
 * @body    {String} name - Category name
 * @body    {File} image - Category image (multipart/form-data)
 * 
 * @returns {Object} success, message, data: { category }
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Category image is required'
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      // Delete uploaded file if category already exists
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Create category with image path
    const category = await Category.create({
      name: name.trim(),
      image: `/uploads/categories/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * 
 * @returns {Object} success, data: { categories }
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 * 
 * @param   {String} id - Category ID
 * 
 * @returns {Object} success, data: { category }
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Category ID
 * @body    {String} name - Category name (optional)
 * @body    {File} image - Category image (optional, multipart/form-data)
 * 
 * @returns {Object} success, message, data: { category }
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      // Delete uploaded file if category doesn't exist
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Update name if provided
    if (name) {
      // Check if another category with same name exists
      const existingCategory = await Category.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        // Delete uploaded file if category name exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
      
      category.name = name.trim();
    }

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image file
      const oldImagePath = path.join(__dirname, '..', category.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Set new image path
      category.image = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Category ID
 * 
 * @returns {Object} success, message
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', category.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete category from database
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

