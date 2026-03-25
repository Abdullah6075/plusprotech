import Appointment from '../models/Appointment.js';
import Model from '../models/Model.js';
import ModelService from '../models/ModelService.js';
import {
  sendAppointmentNotificationToAdmin,
  sendAppointmentConfirmationToCustomer,
  sendRepairCompletedEmail,
} from '../utils/emailService.js';

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

    // Robustly extract YYYY, MM, DD from whatever format the client sends:
    // - "2026-03-28"              (plain date string from <input type="date">)
    // - "2026-03-28T00:00:00.000Z" (full ISO string if Yup/Formik serialised it)
    // - a Date object              (if body-parser deserialised it)
    const dateRaw = (date instanceof Date ? date.toISOString() : (date || '').toString()).trim();
    // Pull the first YYYY-MM-DD token from whatever string we have
    const dateMatch = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      console.error('[createAppointment] Unrecognised date value:', JSON.stringify(date));
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment date. Please use the date picker and try again.'
      });
    }
    const [, yr, mo, dy] = dateMatch.map(Number);
    // Store at noon UTC so the calendar date is the same in any US timezone (avoids off-by-one)
    const appointmentDate = new Date(Date.UTC(yr, mo - 1, dy, 12, 0, 0, 0));

    // Validate date is not in the past
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    if (appointmentDate < todayUTC) {
      return res.status(400).json({
        success: false,
        error: 'Appointment date cannot be in the past'
      });
    }

    // Validate not Sunday (shop is closed)
    const dayOfWeek = appointmentDate.getUTCDay(); // 0 = Sunday
    if (dayOfWeek === 0) {
      return res.status(400).json({
        success: false,
        error: 'We are closed on Sundays. Please select a date from Monday to Saturday.'
      });
    }

    // Validate business hours: 9:00 AM – 7:00 PM
    const [apptHour, apptMin] = time.trim().split(':').map(Number);
    const apptMinutes = apptHour * 60 + apptMin;
    if (isNaN(apptMinutes) || apptMinutes < 9 * 60 || apptMinutes >= 19 * 60) {
      return res.status(400).json({
        success: false,
        error: 'Appointment time must be between 9:00 AM and 7:00 PM (shop hours).'
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

    const emailData = {
      customerName: appointment.name || appointment.customerId?.name,
      customerEmail: appointment.contactEmail || appointment.customerId?.email,
      customerPhone: appointment.contactPhone || appointment.customerId?.contactNumber,
      appointmentTitle: appointment.title,
      modelName: appointment.modelId?.name,
      serviceName: appointment.modelServiceId?.name,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      price: appointment.modelServiceId?.discountedPrice || appointment.modelServiceId?.price,
    };

    // Notify admin (non-blocking)
    sendAppointmentNotificationToAdmin({
      appointment: {
        title: appointment.title,
        description: appointment.description,
        status: appointment.status,
      },
      ...emailData,
    }).catch((err) => console.error('Admin notification email failed:', err));

    // Confirm booking to customer (non-blocking)
    sendAppointmentConfirmationToCustomer(emailData)
      .catch((err) => console.error('Customer confirmation email failed:', err));

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
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

    // Get total count
    const total = await Appointment.countDocuments(filter);

    // Get paginated appointments
    const appointments = await Appointment.find(filter)
      .populate('customerId', 'name email contactNumber contactEmail')
      .populate('modelId', 'name image')
      .populate('modelServiceId', 'name price discountedPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        appointments,
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

    // Track whether status is being changed to 'completed' before saving
    const isBeingCompleted =
      status === 'completed' &&
      user.role === 'admin' &&
      appointment.status !== 'completed';

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

    // Send repair-completed email to customer (non-blocking)
    if (isBeingCompleted) {
      try {
        await sendRepairCompletedEmail({
          customerName: appointment.name || appointment.customerId?.name,
          customerEmail: appointment.contactEmail || appointment.customerId?.contactEmail,
          modelName: appointment.modelId?.name,
          serviceName: appointment.modelServiceId?.name,
          appointmentTitle: appointment.title,
        });
      } catch (emailError) {
        console.error('Failed to send repair-completed email:', emailError);
      }
    }

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
