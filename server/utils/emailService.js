/**
 * Email Service using Brevo (formerly Sendinblue)
 * Handles sending transactional emails via REST API
 */

// Get API key from environment
const getApiKey = () => {
  return process.env.BREVO_API_KEY;
};

/**
 * Send appointment notification email to admin
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Email send result
 */
export const sendAppointmentNotificationToAdmin = async (appointmentData) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('BREVO_API_KEY not found in environment variables. Email functionality will be disabled.');
      return { success: false, message: 'Email service not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL not found in environment variables.');
      return { success: false, message: 'Admin email not configured' };
    }

    // Use Brevo REST API directly

    const {
      appointment,
      customerName,
      customerEmail,
      customerPhone,
      modelName,
      serviceName,
      appointmentDate,
      appointmentTime
    } = appointmentData;

    // Format the appointment date
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create email content
    const sendSmtpEmail = {
      subject: `New Appointment Request - ${appointment.title || 'Appointment'}`,
      htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Appointment Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #000; margin-top: 0;">New Appointment Request</h2>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0;">
              Appointment Details
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; width: 40%;">Appointment Title:</td>
                <td style="padding: 8px 0; color: #000;">${appointment.title || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Status:</td>
                <td style="padding: 8px 0; color: #000; text-transform: capitalize;">${appointment.status || 'confirmed'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Date:</td>
                <td style="padding: 8px 0; color: #000;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Time:</td>
                <td style="padding: 8px 0; color: #000;">${appointmentTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Model:</td>
                <td style="padding: 8px 0; color: #000;">${modelName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Service:</td>
                <td style="padding: 8px 0; color: #000;">${serviceName || 'N/A'}</td>
              </tr>
            </table>

            <h3 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 20px;">
              Customer Information
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; width: 40%;">Name:</td>
                <td style="padding: 8px 0; color: #000;">${customerName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #000;">${customerEmail || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Phone:</td>
                <td style="padding: 8px 0; color: #000;">${customerPhone || 'N/A'}</td>
              </tr>
            </table>

            ${appointment.description ? `
              <h3 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 20px;">
                Description
              </h3>
              <p style="color: #000; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #000; margin: 0;">
                ${appointment.description}
              </p>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                This is an automated notification from PlusProtech Appointment System.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
      textContent: `
New Appointment Request

Appointment Details:
- Title: ${appointment.title || 'N/A'}
- Status: ${appointment.status || 'confirmed'}
- Date: ${formattedDate}
- Time: ${appointmentTime}
- Model: ${modelName || 'N/A'}
- Service: ${serviceName || 'N/A'}

Customer Information:
- Name: ${customerName || 'N/A'}
- Email: ${customerEmail || 'N/A'}
- Phone: ${customerPhone || 'N/A'}

${appointment.description ? `Description: ${appointment.description}` : ''}
    `,
      sender: {
        name: 'PlusProtech',
        email: process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'noreply@plusprotech.com'
      },
      to: [{ email: adminEmail, name: 'Admin' }]
    };

    // Send email via Brevo REST API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(sendSmtpEmail)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Brevo API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending appointment notification email:', error);
    // Don't throw error - email failure shouldn't break appointment creation
    return { success: false, error: error.message };
  }
};
