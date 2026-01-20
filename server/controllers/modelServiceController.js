import ModelService from '../models/ModelService.js';
import Model from '../models/Model.js';
import Service from '../models/Service.js';

/**
 * @route   POST /api/model-services
 * @desc    Create a new model service
 * @access  Private (Admin only - can be added later)
 * 
 * @body    {String} name - Service name
 * @body    {Number} price - Regular price
 * @body    {Number} discountedPrice - Discounted price (optional)
 * @body    {String} modelId - Model ID
 * @body    {String} serviceId - Service ID
 * 
 * @returns {Object} success, message, data: { modelService }
 */
export const createModelService = async (req, res, next) => {
  try {
    const { name, price, discountedPrice, modelId, serviceId } = req.body;

    // Validate that model exists
    const model = await Model.findById(modelId);
    if (!model) {
      return res.status(400).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Validate that service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Check if model service combination already exists
    const existingModelService = await ModelService.findOne({ 
      modelId, 
      serviceId 
    });
    if (existingModelService) {
      return res.status(400).json({
        success: false,
        error: 'This service is already associated with this model'
      });
    }

    // Validate discounted price
    if (discountedPrice && discountedPrice > price) {
      return res.status(400).json({
        success: false,
        error: 'Discounted price must be less than or equal to regular price'
      });
    }

    // Create model service
    const modelService = await ModelService.create({
      name: name.trim(),
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
      modelId,
      serviceId
    });

    // Populate references
    await modelService.populate('modelId', 'name image');
    await modelService.populate('serviceId', 'name');

    res.status(201).json({
      success: true,
      message: 'Model service created successfully',
      data: {
        modelService
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/model-services
 * @desc    Get all model services
 * @access  Public
 * 
 * @query   {String} modelId - Filter by model ID (optional)
 * @query   {String} serviceId - Filter by service ID (optional)
 * 
 * @returns {Object} success, data: { modelServices }
 */
export const getAllModelServices = async (req, res, next) => {
  try {
    const { modelId, serviceId } = req.query;
    const filter = {};

    if (modelId) {
      filter.modelId = modelId;
    }
    if (serviceId) {
      filter.serviceId = serviceId;
    }

    const modelServices = await ModelService.find(filter)
      .populate('modelId', 'name image')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        modelServices
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/model-services/:id
 * @desc    Get single model service by ID
 * @access  Public
 * 
 * @param   {String} id - Model Service ID
 * 
 * @returns {Object} success, data: { modelService }
 */
export const getModelServiceById = async (req, res, next) => {
  try {
    const modelService = await ModelService.findById(req.params.id)
      .populate('modelId', 'name image')
      .populate('serviceId', 'name');

    if (!modelService) {
      return res.status(404).json({
        success: false,
        error: 'Model service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        modelService
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/model-services/:id
 * @desc    Update model service
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Model Service ID
 * @body    {String} name - Service name (optional)
 * @body    {Number} price - Regular price (optional)
 * @body    {Number} discountedPrice - Discounted price (optional)
 * @body    {String} modelId - Model ID (optional)
 * @body    {String} serviceId - Service ID (optional)
 * 
 * @returns {Object} success, message, data: { modelService }
 */
export const updateModelService = async (req, res, next) => {
  try {
    const { name, price, discountedPrice, modelId, serviceId } = req.body;
    const modelService = await ModelService.findById(req.params.id);

    if (!modelService) {
      return res.status(404).json({
        success: false,
        error: 'Model service not found'
      });
    }

    // Validate model if modelId is being updated
    if (modelId) {
      const model = await Model.findById(modelId);
      if (!model) {
        return res.status(400).json({
          success: false,
          error: 'Model not found'
        });
      }
    }

    // Validate service if serviceId is being updated
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(400).json({
          success: false,
          error: 'Service not found'
        });
      }
    }

    // Check for duplicate combination if modelId or serviceId is being updated
    const finalModelId = modelId || modelService.modelId;
    const finalServiceId = serviceId || modelService.serviceId;
    
    if (modelId || serviceId) {
      const existingModelService = await ModelService.findOne({
        modelId: finalModelId,
        serviceId: finalServiceId,
        _id: { $ne: req.params.id }
      });
      
      if (existingModelService) {
        return res.status(400).json({
          success: false,
          error: 'This service is already associated with this model'
        });
      }
    }

    // Update fields
    if (name) {
      modelService.name = name.trim();
    }
    if (price !== undefined) {
      modelService.price = parseFloat(price);
    }
    if (discountedPrice !== undefined) {
      modelService.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : undefined;
    }
    if (modelId) {
      modelService.modelId = modelId;
    }
    if (serviceId) {
      modelService.serviceId = serviceId;
    }

    // Validate discounted price
    if (modelService.discountedPrice && modelService.discountedPrice > modelService.price) {
      return res.status(400).json({
        success: false,
        error: 'Discounted price must be less than or equal to regular price'
      });
    }

    await modelService.save();

    // Populate references
    await modelService.populate('modelId', 'name image');
    await modelService.populate('serviceId', 'name');

    res.status(200).json({
      success: true,
      message: 'Model service updated successfully',
      data: {
        modelService
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/model-services/:id
 * @desc    Delete model service
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Model Service ID
 * 
 * @returns {Object} success, message
 */
export const deleteModelService = async (req, res, next) => {
  try {
    const modelService = await ModelService.findById(req.params.id);

    if (!modelService) {
      return res.status(404).json({
        success: false,
        error: 'Model service not found'
      });
    }

    // Delete model service from database
    await ModelService.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Model service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
