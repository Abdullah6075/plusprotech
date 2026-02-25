import Inventory from '../models/Inventory.js';

/**
 * @route   POST /api/inventory
 * @desc    Create a new inventory item
 * @access  Private (Admin)
 * 
 * @body    {String} name - Item name
 * @body    {String} description - Item description (optional)
 * @body    {Number} price - Item price
 * @body    {Number} quantity - Item quantity
 * @body    {String} unit - Unit of measurement (optional)
 * 
 * @returns {Object} success, message, data: { inventory }
 */
export const createInventory = async (req, res, next) => {
  try {
    const { name, description, price, quantity, unit } = req.body;

    // Check if item with same name already exists
    const existingItem = await Inventory.findOne({ name: name.trim() });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Inventory item with this name already exists'
      });
    }

    const inventory = await Inventory.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      price,
      quantity,
      unit: unit?.trim() || 'piece'
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items
 * @access  Private (Admin)
 * 
 * @returns {Object} success, data: { inventory }
 */
export const getAllInventory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Inventory.countDocuments();

    // Get paginated inventory
    const inventory = await Inventory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        inventory,
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
 * @route   GET /api/inventory/:id
 * @desc    Get single inventory item by ID
 * @access  Private (Admin)
 * 
 * @param   {String} id - Inventory ID
 * 
 * @returns {Object} success, data: { inventory }
 */
export const getInventoryById = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item
 * @access  Private (Admin)
 * 
 * @param   {String} id - Inventory ID
 * @body    {String} name - Item name (optional)
 * @body    {String} description - Item description (optional)
 * @body    {Number} price - Item price (optional)
 * @body    {Number} quantity - Item quantity (optional)
 * @body    {String} unit - Unit of measurement (optional)
 * 
 * @returns {Object} success, message, data: { inventory }
 */
export const updateInventory = async (req, res, next) => {
  try {
    const { name, description, price, quantity, unit } = req.body;
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if another item with same name exists
    if (name) {
      const existingItem = await Inventory.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          error: 'Inventory item with this name already exists'
        });
      }
      
      inventory.name = name.trim();
    }

    if (description !== undefined) {
      inventory.description = description?.trim() || undefined;
    }
    if (price !== undefined) {
      inventory.price = price;
    }
    if (quantity !== undefined) {
      inventory.quantity = quantity;
    }
    if (unit !== undefined) {
      inventory.unit = unit?.trim() || 'piece';
    }

    await inventory.save();

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item
 * @access  Private (Admin)
 * 
 * @param   {String} id - Inventory ID
 * 
 * @returns {Object} success, message
 */
export const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
