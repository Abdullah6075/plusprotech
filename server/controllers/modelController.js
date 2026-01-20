import Model from '../models/Model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route   POST /api/models
 * @desc    Create a new model
 * @access  Private (Admin only - can be added later)
 * 
 * @body    {String} name - Model name
 * @body    {File} image - Model image (multipart/form-data)
 * 
 * @returns {Object} success, message, data: { model }
 */
export const createModel = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Model image is required'
      });
    }

    // Check if model with same name already exists
    const existingModel = await Model.findOne({ name: name.trim() });
    if (existingModel) {
      // Delete uploaded file if model already exists
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Model with this name already exists'
      });
    }

    // Create model with image path
    const model = await Model.create({
      name: name.trim(),
      image: `/uploads/models/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      message: 'Model created successfully',
      data: {
        model
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
 * @route   GET /api/models
 * @desc    Get all models
 * @access  Public
 * 
 * @returns {Object} success, data: { models }
 */
export const getAllModels = async (req, res, next) => {
  try {
    const models = await Model.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        models
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/models/:id
 * @desc    Get single model by ID
 * @access  Public
 * 
 * @param   {String} id - Model ID
 * 
 * @returns {Object} success, data: { model }
 */
export const getModelById = async (req, res, next) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        model
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/models/:id
 * @desc    Update model
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Model ID
 * @body    {String} name - Model name (optional)
 * @body    {File} image - Model image (optional, multipart/form-data)
 * 
 * @returns {Object} success, message, data: { model }
 */
export const updateModel = async (req, res, next) => {
  try {
    const { name } = req.body;
    const model = await Model.findById(req.params.id);

    if (!model) {
      // Delete uploaded file if model doesn't exist
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Update name if provided
    if (name) {
      // Check if another model with same name exists
      const existingModel = await Model.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingModel) {
        // Delete uploaded file if model name exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: 'Model with this name already exists'
        });
      }
      
      model.name = name.trim();
    }

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image file
      const oldImagePath = path.join(__dirname, '..', model.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Set new image path
      model.image = `/uploads/models/${req.file.filename}`;
    }

    await model.save();

    res.status(200).json({
      success: true,
      message: 'Model updated successfully',
      data: {
        model
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
 * @route   DELETE /api/models/:id
 * @desc    Delete model
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Model ID
 * 
 * @returns {Object} success, message
 */
export const deleteModel = async (req, res, next) => {
  try {
    const model = await Model.findById(req.params.id);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', model.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete model from database
    await Model.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
