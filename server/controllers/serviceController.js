import Service from '../models/Service.js';

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (Admin only - can be added later)
 * 
 * @body    {String} name - Service name
 * 
 * @returns {Object} success, message, data: { service }
 */
export const createService = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if service with same name already exists
    const existingService = await Service.findOne({ name: name.trim() });
    if (existingService) {
      return res.status(400).json({
        success: false,
        error: 'Service with this name already exists'
      });
    }

    // Create service
    const service = await Service.create({
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/services
 * @desc    Get all services with pagination
 * @access  Public
 * 
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 10)
 * 
 * @returns {Object} success, data: { services, pagination }
 */
export const getAllServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Service.countDocuments();

    // Get paginated services
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/services/:id
 * @desc    Get single service by ID
 * @access  Public
 * 
 * @param   {String} id - Service ID
 * 
 * @returns {Object} success, data: { service }
 */
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/services/:id
 * @desc    Update service
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Service ID
 * @body    {String} name - Service name
 * 
 * @returns {Object} success, message, data: { service }
 */
export const updateService = async (req, res, next) => {
  try {
    const { name } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Update name if provided
    if (name) {
      // Check if another service with same name exists
      const existingService = await Service.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingService) {
        return res.status(400).json({
          success: false,
          error: 'Service with this name already exists'
        });
      }
      
      service.name = name.trim();
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service
 * @access  Private (Admin only - can be added later)
 * 
 * @param   {String} id - Service ID
 * 
 * @returns {Object} success, message
 */
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Delete service from database
    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
