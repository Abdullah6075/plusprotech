import React from 'react';
import { useGetInvoiceByAppointmentIdQuery } from '../services/invoiceApi';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';

/**
 * Invoice Button Component
 * Shows Create Invoice or View Invoice button based on invoice existence
 */
const InvoiceButton = ({ appointment, onCreateInvoice, onViewInvoice, showForAllStatuses = false }) => {
  const { data: invoiceData, isLoading, error } = useGetInvoiceByAppointmentIdQuery(
    appointment._id,
    { skip: !appointment._id }
  );

  // Invoice exists if we have data
  // 404 errors are expected when no invoice exists yet, so we ignore them
  const hasInvoice = invoiceData?.data?.invoice;
  const isError = error && error?.status !== 404; // Only treat non-404 errors as real errors

  // For admin: only show for completed appointments
  // For customer: show if invoice exists (regardless of status)
  if (!showForAllStatuses && appointment.status !== 'completed') {
    return null;
  }

  // For customer view: only show if invoice exists
  if (showForAllStatuses && !hasInvoice && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs sm:text-sm h-8"
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (hasInvoice) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs sm:text-sm h-8"
        onClick={() => onViewInvoice && onViewInvoice(appointment)}
      >
        <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        View Invoice
      </Button>
    );
  }

  // Only show Create Invoice button if onCreateInvoice is provided (admin only)
  if (onCreateInvoice) {
    return (
      <Button
        variant="default"
        size="sm"
        className="w-full text-xs sm:text-sm h-8"
        onClick={() => onCreateInvoice(appointment)}
      >
        <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        Create Invoice
      </Button>
    );
  }

  return null;
};

export default InvoiceButton;
