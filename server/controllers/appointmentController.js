import Appointment from '../models/Appointment.js';
import Model from '../models/Model.js';
import ModelService from '../models/ModelService.js';

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private (Customer)
 * 
 * @body    {String} title - Appointment title
 * @body    {String} description - Appointment description (optional)
 * @body    {String} modelId - Model ID
 * @body    {String} modelServiceId - Model Service ID
 * 
 * @returns {Object} success, message, data: { appointment }
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { title, description, name, contactPhone, contactEmail, date, time, modelId, modelServiceId } = req.body;
    const customerId = req.user?._id || null; // Optional - for guest appointments

    // Validate that model exists
    const model = await Model.findById(modelId);
    if (!model) {
      return res.status(400).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Validate that model service exists
    const modelService = await ModelService.findById(modelServiceId);
    if (!modelService) {
      return res.status(400).json({
        success: false,
        error: 'Model service not found'
      });
    }

    // Verify that model service belongs to the selected model
    if (modelService.modelId.toString() !== modelId) {
      return res.status(400).json({
        success: false,
        error: 'Model service does not belong to the selected model'
      });
    }

    // Validate date is not in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Appointment date cannot be in the past'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      title: title.trim(),
      description: description?.trim() || undefined,
      customerId,
      name: name.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      date: appointmentDate,
      time: time.trim(),
      modelId,
      modelServiceId
    });

    // Populate references
    if (appointment.customerId) {
      await appointment.populate('customerId', 'name email contactNumber contactEmail');
    }
    await appointment.populate('modelId', 'name image');
    await appointment.populate('modelServiceId', 'name price discountedPrice');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully. Your appointment is confirmed, please visit us on the scheduled date and time.',
      data: {
        appointment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (admin) or customer's appointments
 * @access  Private
 * 
 * @query   {String} status - Filter by status (optional)
 * @query   {String} search - Search in title, name, email, phone (optional)
 * 
 * @returns {Object} success, data: { appointments }
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, search } = req.query;
    const filter = {};

    // If user is not admin, only show their own appointments
    if (user && user.role !== 'admin') {
      filter.customerId = user._id;
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { name: searchRegex },
        { contactEmail: searchRegex },
        { contactPhone: searchRegex },
        { description: searchRegex }
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'name email contactNumber contactEmail')
      .populate('modelId', 'name image')
      .populate('modelServiceId', 'name price discountedPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        appointments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment by ID
 * @access  Private
 * 
 * @param   {String} id - Appointment ID
 * 
 * @returns {Object} success, data: { appointment }
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const user = req.user;
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'name email contactNumber contactEmail')
      .populate('modelId', 'name image')
      .populate('modelServiceId', 'name price discountedPrice');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // If user is not admin, only allow access to their own appointments
    if (user.role !== 'admin' && appointment.customerId._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        appointment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment
 * @access  Private
 * 
 * @param   {String} id - Appointment ID
 * @body    {String} title - Appointment title (optional)
 * @body    {String} description - Appointment description (optional)
 * @body    {String} status - Appointment status (optional, admin only)
 * 
 * @returns {Object} success, message, data: { appointment }
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const user = req.user;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // If user is not admin, only allow access to their own appointments
    if (user.role !== 'admin' && appointment.customerId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Only admin can update status
    if (status && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update appointment status'
      });
    }

    // Update fields
    if (title) {
      appointment.title = title.trim();
    }
    if (description !== undefined) {
      appointment.description = description?.trim() || undefined;
    }
    if (status && user.role === 'admin') {
      appointment.status = status;
    }

    await appointment.save();

    // Populate references
    await appointment.populate('customerId', 'name email contactNumber contactEmail');
    await appointment.populate('modelId', 'name image');
    await appointment.populate('modelServiceId', 'name price discountedPrice');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete appointment
 * @access  Private
 * 
 * @param   {String} id - Appointment ID
 * 
 * @returns {Object} success, message
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const user = req.user;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // If user is not admin, only allow deletion of their own appointments
    if (user.role !== 'admin' && appointment.customerId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Delete appointment from database
    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
