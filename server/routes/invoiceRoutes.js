import express from 'express';
import {
  createInvoice,
  getInvoiceByAppointmentId,
  getInvoiceById
} from '../controllers/invoiceController.js';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { createInvoiceValidation } from '../validations/invoiceValidation.js';

const router = express.Router();

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice
 * @access  Private (Admin)
 */
router.post(
  '/',
  auth,
  validate(createInvoiceValidation),
  createInvoice
);

/**
 * @route   GET /api/invoices/appointment/:appointmentId
 * @desc    Get invoice by appointment ID
 * @access  Private
 */
router.get('/appointment/:appointmentId', auth, getInvoiceByAppointmentId);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/:id', auth, getInvoiceById);

export default router;
