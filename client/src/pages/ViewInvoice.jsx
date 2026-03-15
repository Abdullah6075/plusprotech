import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetInvoiceByAppointmentIdQuery } from '../services/invoiceApi';
import { useGetAppointmentByIdQuery } from '../services/appointmentApi';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Printer, ArrowLeft } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import logo from '../assets/logo.png';

/**
 * View Invoice Page
 * Shows invoice details with QR code and print functionality
 */
const ViewInvoice = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { data: invoiceData, isLoading: isLoadingInvoice } = useGetInvoiceByAppointmentIdQuery(
    appointmentId,
    { skip: !appointmentId }
  );
  const { data: appointmentData, isLoading: isLoadingAppointment } = useGetAppointmentByIdQuery(
    appointmentId,
    { skip: !appointmentId }
  );

  const invoice = invoiceData?.data?.invoice;
  const appointment = appointmentData?.data?.appointment;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;

    // Get logo image source
    const logoImg = document.getElementById('invoice-logo');
    const logoSrc = logoImg ? logoImg.src : '';

    // Get QR code image source if it exists
    const qrCodeImg = invoiceContent.querySelector('#qr-code-section img');
    let qrCodeHtml = '';
    if (qrCodeImg && invoice.qrCode) {
      qrCodeHtml = `
        <div class="qr-code" style="text-align: center; margin: 10px 0; page-break-inside: avoid; border-top: 1px solid #000000; padding-top: 10px;">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: #000000; font-size: 11px;">Scan to View Appointment</h3>
          <img src="${invoice.qrCode}" alt="QR Code" style="max-width: 120px; height: auto; display: block; margin: 0 auto; border: 1px solid #000000; padding: 5px; background: white;" />
          <p style="font-size: 10px; color: #666666; margin-top: 5px;">Scan this QR code to view your appointment details</p>
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
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 15px; margin: 0; background: white; color: #000000; }
            .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #000000; }
            .header-left { flex: 1; }
            .logo-container { margin-bottom: 8px; }
            .logo-container img { max-height: 40px; width: auto; }
            .company-name { font-size: 18px; font-weight: 700; color: #000000; margin-bottom: 2px; }
            .company-tagline { font-size: 11px; color: #666666; }
            .company-details { font-size: 10px; color: #000000; margin-top: 5px; line-height: 1.4; }
            .company-details div { margin-bottom: 2px; }
            .header-right { text-align: right; }
            .invoice-title { font-size: 28px; font-weight: 700; color: #000000; margin-bottom: 5px; }
            .invoice-number { font-size: 11px; color: #666666; margin-bottom: 2px; }
            .invoice-date { font-size: 11px; color: #666666; }
            .section { margin-bottom: 12px; }
            .section-title { font-weight: 600; margin-bottom: 8px; color: #000000; font-size: 12px; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
            .info-card { border: 1px solid #000000; padding: 10px; background: #ffffff; }
            .info-card h3 { font-weight: 600; margin-bottom: 8px; margin-top: 0; color: #000000; font-size: 11px; text-transform: uppercase; }
            .info-item { margin-bottom: 4px; font-size: 11px; display: flex; justify-content: space-between; }
            .info-item strong { color: #666666; font-weight: 500; }
            .info-item span { color: #000000; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #000000; }
            th, td { padding: 8px; text-align: left; border: 1px solid #000000; }
            th { background: #000000; color: white; font-weight: 600; font-size: 11px; text-transform: uppercase; }
            td { font-size: 11px; color: #000000; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .total-row { background: #000000; color: white; font-weight: 700; }
            .total-row td { color: white; font-size: 13px; }
            .notes-section { border-top: 1px solid #000000; padding-top: 10px; margin-top: 10px; }
            .notes-section h3 { font-weight: 600; margin-bottom: 5px; color: #000000; font-size: 11px; text-transform: uppercase; }
            .notes-section p { font-size: 11px; color: #000000; line-height: 1.4; white-space: pre-wrap; }
            .qr-code { text-align: center; margin: 10px 0; page-break-inside: avoid; border-top: 1px solid #000000; padding-top: 10px; }
            .qr-code h3 { font-weight: 600; margin-bottom: 8px; color: #000000; font-size: 11px; }
            .qr-code img { max-width: 120px; height: auto; display: block; margin: 0 auto; border: 1px solid #000000; padding: 5px; background: white; }
            .qr-code p { font-size: 10px; color: #666666; margin-top: 5px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; background: white; }
              .invoice-container { padding: 15px; }
              @page { margin: 1cm; size: A4; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="header-left">
                ${logoSrc ? `<div class="logo-container"><img src="${logoSrc}" alt="Logo" style="max-height: 40px;" /></div>` : ''}
                <div class="company-name">PlusProtech</div>
                <div class="company-tagline">Professional Device Repair Services</div>
                <div class="company-details">
                  <div>1823 7th Street</div>
                  <div>Moline, Illinois</div>
                  <div>Phone: 309-762-7500</div>
                  <div>Email: protech0786@gmail.com</div>
                </div>
              </div>
              <div class="header-right">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">Invoice #: ${invoice._id.slice(-8).toUpperCase()}</div>
                <div class="invoice-date">Date: ${new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <h3>Customer Information</h3>
                <div class="info-item">
                  <strong>Name:</strong>
                  <span>${appointment?.name || appointment?.customerId?.name || 'Guest'}</span>
                </div>
                <div class="info-item">
                  <strong>Email:</strong>
                  <span>${appointment?.contactEmail || appointment?.customerId?.email || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <strong>Phone:</strong>
                  <span>${appointment?.contactPhone || appointment?.customerId?.contactNumber || 'N/A'}</span>
                </div>
              </div>
              <div class="info-card">
                <h3>Appointment Details</h3>
                <div class="info-item">
                  <strong>Model:</strong>
                  <span>${appointment?.modelId?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <strong>Service:</strong>
                  <span>${appointment?.modelServiceId?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <strong>Date:</strong>
                  <span>${appointment?.date ? new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                </div>
                <div class="info-item">
                  <strong>Time:</strong>
                  <span>${appointment?.time || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Items Used</h3>
              <table>
                <thead>
                  <tr>
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
                    <td colspan="2" class="text-right">Total:</td>
                    <td class="text-right">$${invoice.total.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="font-size: 9px; color: #666666; font-style: italic; padding-top: 5px; text-align: center;">
                      * Item costs are already included in the total service price
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${invoice.description ? `
              <div class="notes-section">
                <h3>Notes</h3>
                <p>${invoice.description}</p>
              </div>
            ` : ''}

            ${qrCodeHtml}
          </div>
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

  if (isLoadingInvoice || isLoadingAppointment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <p className="text-muted-foreground mb-6">No invoice found for this appointment.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link 
          to={appointment?.customerId ? '/dashboard/appointments' : '/dashboard/admin-appointments'} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <Button onClick={handlePrint} className="no-print">
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <Card className="shadow-sm border border-black">
        <CardContent className="p-4 md:p-5">
          <div id="invoice-content" className="space-y-4">
            {/* Header with Logo */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 pb-3 border-b-2 border-black">
              <div className="flex-1">
                <div className="mb-2">
                  <img 
                    id="invoice-logo"
                    src={logo} 
                    alt="PlusProtech Logo" 
                    className="h-8 md:h-10 w-auto object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-black mb-0.5">PlusProtech</h2>
                <p className="text-xs text-gray-600 mb-2">Professional Device Repair Services</p>
                <div className="text-xs text-black space-y-0.5">
                  <div>1823 7th Street</div>
                  <div>Moline, IL</div>
                  <div>Phone: 309-762-7500</div>
                  <div>Email: protech0786@gmail.com</div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">INVOICE</h1>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600">
                    Invoice #: <span className="font-semibold text-black">{invoice._id.slice(-8).toUpperCase()}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Date: <span className="font-semibold text-black">
                      {new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Customer & Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded p-3 border border-black">
                <h3 className="font-semibold mb-2 text-black uppercase text-xs">Customer Information</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="font-semibold text-black">
                      {appointment?.name || appointment?.customerId?.name || 'Guest'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="font-semibold text-black">
                      {appointment?.contactEmail || appointment?.customerId?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Phone:</span>
                    <span className="font-semibold text-black">
                      {appointment?.contactPhone || appointment?.customerId?.contactNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-3 border border-black">
                <h3 className="font-semibold mb-2 text-black uppercase text-xs">Appointment Details</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Model:</span>
                    <span className="font-semibold text-black">{appointment?.modelId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Service:</span>
                    <Badge variant="outline" className="font-semibold border-black text-black">{appointment?.modelServiceId?.name || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="font-semibold text-black">
                      {appointment?.date ? new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Time:</span>
                    <span className="font-semibold text-black">{appointment?.time || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-2 text-black uppercase text-xs">Items Used</h3>
              <div className="border border-black overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black">
                      <th className="p-2 text-left text-white font-semibold text-xs uppercase">Item</th>
                      <th className="p-2 text-center text-white font-semibold text-xs uppercase">Quantity</th>
                      <th className="p-2 text-right text-white font-semibold text-xs uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-black">
                        <td className="p-2 font-medium text-black text-xs">{item.name}</td>
                        <td className="p-2 text-center text-black text-xs">{item.quantity}</td>
                        <td className="p-2 text-right text-black text-xs">-</td>
                      </tr>
                    ))}
                    <tr className="bg-black">
                      <td colSpan="2" className="p-2 font-bold text-right text-sm text-white">Total:</td>
                      <td className="p-2 text-right font-bold text-sm text-white">${invoice.total.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="p-2 text-xs text-gray-600 text-center italic bg-white">
                        * Item costs are already included in the total service price
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description */}
            {invoice.description && (
              <div className="border-t border-black pt-3">
                <h3 className="font-semibold mb-2 text-black uppercase text-xs">Notes</h3>
                <div className="bg-white rounded p-2 border border-black">
                  <p className="text-xs text-black whitespace-pre-wrap leading-relaxed">{invoice.description}</p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {invoice.qrCode && (
              <div className="text-center border-t border-black pt-3" id="qr-code-section">
                <h3 className="font-semibold mb-2 text-black text-xs">Scan to View Appointment</h3>
                <div className="flex justify-center">
                  <div className="bg-white p-2 border border-black inline-block">
                    <img 
                      src={invoice.qrCode} 
                      alt="QR Code" 
                      loading="lazy"
                      decoding="async"
                      width="120"
                      height="120"
                      className="w-30 h-30" 
                      style={{ imageRendering: 'auto' }} 
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Scan this QR code to view your appointment details
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewInvoice;
