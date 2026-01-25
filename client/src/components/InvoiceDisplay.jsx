import React from 'react';
import { useGetInvoiceByAppointmentIdQuery } from '../services/invoiceApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Printer, DollarSign, Package } from 'lucide-react';

/**
 * Invoice Display Component
 * Shows invoice details with QR code and print functionality
 */
const InvoiceDisplay = ({ open, onOpenChange, appointment }) => {
  const { data, isLoading } = useGetInvoiceByAppointmentIdQuery(
    appointment?._id,
    { skip: !appointment?._id }
  );

  const invoice = data?.data?.invoice;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;

    // Clone the content to avoid modifying the original
    const contentClone = invoiceContent.cloneNode(true);
    
    // Get QR code image source if it exists
    const qrCodeImg = contentClone.querySelector('#qr-code-section img');
    let qrCodeHtml = '';
    if (qrCodeImg && invoice.qrCode) {
      qrCodeHtml = `
        <div class="qr-code" style="text-align: center; margin: 20px 0; page-break-inside: avoid; border-top: 1px solid #ddd; padding-top: 20px;">
          <h3 style="font-weight: bold; margin-bottom: 10px;">Scan to View Appointment</h3>
          <img src="${invoice.qrCode}" alt="QR Code" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          <p style="font-size: 12px; color: #666; margin-top: 10px;">Scan this QR code to view your appointment details</p>
        </div>
      `;
    }

    // Build the invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${appointment?.title || 'Invoice'}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-card { border: 1px solid #ddd; padding: 15px; border-radius: 4px; }
            .info-card h3 { font-weight: bold; margin-bottom: 10px; margin-top: 0; }
            .info-item { margin-bottom: 5px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bg-muted { background-color: #f5f5f5; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 18px; }
            .total-row { background-color: #e3f2fd; }
            .qr-code { text-align: center; margin: 20px 0; page-break-inside: avoid; border-top: 1px solid #ddd; padding-top: 20px; }
            .qr-code img { max-width: 200px; height: auto; display: block; margin: 0 auto; }
            @media print {
              .no-print { display: none; }
              body { padding: 10px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">INVOICE</h2>
            <p style="margin: 5px 0; font-size: 14px;">Invoice #: ${invoice._id.slice(-8).toUpperCase()}</p>
            <p style="margin: 5px 0; font-size: 14px;">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>Customer Information</h3>
              <div class="info-item"><strong>Name:</strong> ${appointment?.name || appointment?.customerId?.name || 'Guest'}</div>
              <div class="info-item"><strong>Email:</strong> ${appointment?.contactEmail || appointment?.customerId?.email || 'N/A'}</div>
              <div class="info-item"><strong>Phone:</strong> ${appointment?.contactPhone || appointment?.customerId?.contactNumber || 'N/A'}</div>
            </div>
            <div class="info-card">
              <h3>Appointment Details</h3>
              <div class="info-item"><strong>Model:</strong> ${appointment?.modelId?.name || 'N/A'}</div>
              <div class="info-item"><strong>Service:</strong> ${appointment?.modelServiceId?.name || 'N/A'}</div>
              <div class="info-item"><strong>Date:</strong> ${appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}</div>
              <div class="info-item"><strong>Time:</strong> ${appointment?.time || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Items Used</h3>
            <table>
              <thead>
                <tr class="bg-muted">
                  <th>Item</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">-</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="text-right font-bold text-lg">Total:</td>
                  <td class="text-right font-bold text-lg">$${invoice.total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-xs text-muted-foreground" style="font-style: italic; padding-top: 10px;">
                    * Item costs are already included in the total service price
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          ${invoice.description ? `
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
              <h3 style="font-weight: bold; margin-bottom: 10px;">Notes</h3>
              <p style="font-size: 14px; color: #666; white-space: pre-wrap;">${invoice.description}</p>
            </div>
          ` : ''}

          ${qrCodeHtml}
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Invoice...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Not Found</DialogTitle>
            <DialogDescription>No invoice found for this appointment.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
          <DialogDescription>Invoice details for {appointment?.title}</DialogDescription>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-sm text-muted-foreground">
              Invoice #: {invoice._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Customer & Appointment Details */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    <span className="font-medium">
                      {appointment?.name || appointment?.customerId?.name || 'Guest'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">
                      {appointment?.contactEmail || appointment?.customerId?.email || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium">
                      {appointment?.contactPhone || appointment?.customerId?.contactNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Appointment Details</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model: </span>
                    <span className="font-medium">{appointment?.modelId?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service: </span>
                    <Badge variant="outline">{appointment?.modelServiceId?.name || 'N/A'}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-medium">
                      {appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time: </span>
                    <span className="font-medium">{appointment?.time || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-3">Items Used</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-left border">Item</th>
                  <th className="p-3 text-center border">Quantity</th>
                  <th className="p-3 text-right border">Total</th>
                </tr>
              </thead>
              <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 border">{item.name}</td>
                      <td className="p-3 text-center border">{item.quantity}</td>
                      <td className="p-3 text-right border">-</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-primary/10">
                    <td colSpan="2" className="p-3 font-bold text-right text-lg border">Total:</td>
                    <td className="p-3 text-right font-bold text-lg border">${invoice.total.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="p-3 text-xs text-muted-foreground border" style={{ fontStyle: 'italic' }}>
                      * Item costs are already included in the total service price
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.description}</p>
            </div>
          )}

          {/* QR Code */}
          {invoice.qrCode && (
            <div className="text-center border-t pt-4" id="qr-code-section">
              <h3 className="font-semibold mb-2">Scan to View Appointment</h3>
              <div className="flex justify-center">
                <img src={invoice.qrCode} alt="QR Code" className="w-48 h-48" style={{ imageRendering: 'auto' }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan this QR code to view your appointment details
              </p>
            </div>
          )}
        </div>

        {/* Print Button */}
        <div className="flex justify-end pt-4 border-t no-print">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDisplay;
