import Invoice from '../models/Invoice.js';
import Appointment from '../models/Appointment.js';
import Inventory from '../models/Inventory.js';
import qrcode from 'qrcode';

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice for an appointment
 * @access  Private (Admin)
 * 
 * @body    {String} appointmentId - Appointment ID
 * @body    {Array} items - Array of { inventoryId, quantity }
 * 
 * @returns {Object} success, message, data: { invoice }
 */
export const createInvoice = async (req, res, next) => {
  try {
    const { appointmentId, items, totalPrice, description } = req.body;

    // Validate appointment exists and is completed
    const appointment = await Appointment.findById(appointmentId)
      .populate('modelId', 'name image')
      .populate('modelServiceId', 'name price discountedPrice')
      .populate('customerId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Invoice can only be created for completed appointments'
      });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ appointmentId });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        error: 'Invoice already exists for this appointment'
      });
    }

    // Process items (items are for tracking only, cost is already in service price)
    // Items are optional - some repairs may not need inventory items
    const invoiceItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const inventory = await Inventory.findById(item.inventoryId);
        if (!inventory) {
          return res.status(400).json({
            success: false,
            error: `Inventory item with ID ${item.inventoryId} not found`
          });
        }

        if (inventory.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient quantity for ${inventory.name}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
          });
        }

        // Store item info for tracking (price is not used in calculation)
        invoiceItems.push({
          inventoryId: inventory._id,
          name: inventory.name,
          quantity: item.quantity,
          price: inventory.price, // Store original price for reference only
          total: inventory.price * item.quantity // For reference only
        });

        // Update inventory quantity
        inventory.quantity -= item.quantity;
        await inventory.save();
      }
    }

    // Use the editable total price provided by admin
    const servicePrice = appointment.modelServiceId?.discountedPrice || appointment.modelServiceId?.price || 0;
    const subtotal = totalPrice; // Subtotal is the editable total price
    const total = totalPrice; // Total is the editable total price

    // Generate QR code if customer is authenticated
    let qrCode = null;
    let qrCodeUrl = null;
    
    if (appointment.customerId) {
      // Generate URL to appointment page (adjust based on your frontend URL)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      qrCodeUrl = `${frontendUrl}/dashboard/appointments`;
      
      try {
        // Generate QR code as data URL
        qrCode = await qrcode.toDataURL(qrCodeUrl);
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        // Continue without QR code if generation fails
      }
    }

    // Create invoice
    const invoice = await Invoice.create({
      appointmentId,
      items: invoiceItems,
      servicePrice,
      subtotal,
      total,
      description: description?.trim() || undefined,
      qrCode,
      qrCodeUrl
    });

    // Populate references
    await invoice.populate('appointmentId');
    await invoice.populate('items.inventoryId');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/invoices/appointment/:appointmentId
 * @desc    Get invoice by appointment ID
 * @access  Private
 * 
 * @param   {String} appointmentId - Appointment ID
 * 
 * @returns {Object} success, data: { invoice }
 */
export const getInvoiceByAppointmentId = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ appointmentId: req.params.appointmentId })
      .populate('appointmentId')
      .populate('items.inventoryId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found for this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 * 
 * @param   {String} id - Invoice ID
 * 
 * @returns {Object} success, data: { invoice }
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('appointmentId')
      .populate('items.inventoryId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};
