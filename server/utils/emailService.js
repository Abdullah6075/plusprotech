/**
 * Email Service using Brevo (formerly Sendinblue)
 * Handles sending transactional emails via REST API
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the logo source for email templates.
// Gmail and most web-based email clients block data: URIs, so we prefer a
// public HTTPS URL.  In local development we fall back to a base64 embed.
const _buildLogoSrc = () => {
  const backendUrl = (process.env.BACKEND_URL || '').trim().replace(/\/$/, '');
  // Use public URL when deployed (non-localhost)
  if (backendUrl && !backendUrl.includes('localhost')) {
    return `${backendUrl}/logo.png`;
  }
  // Dev fallback: inline base64 (works in desktop clients, not Gmail)
  try {
    const logoPath = path.join(__dirname, '..', 'logo.png');
    if (fs.existsSync(logoPath)) {
      return `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    }
  } catch (e) {
    console.warn('Could not embed logo in email template:', e.message);
  }
  return '';
};
const LOGO_SRC = _buildLogoSrc();

// Get API key from environment (trim any accidental whitespace)
const getApiKey = () => {
  const raw = process.env.BREVO_API_KEY;
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/\s+/g, '');
};

/**
 * Shared helper — posts a payload to Brevo's SMTP endpoint
 */
const sendViaBrevo = async (payload) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('BREVO_API_KEY not set. Email skipped.');
    return { success: false, message: 'Email service not configured' };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Unknown error' }));
    const msg = err.message || response.statusText;
    if (response.status === 401 || msg.toLowerCase().includes('key not found')) {
      console.error(
        'Brevo auth failed: Regenerate key at https://app.brevo.com/settings/keys/api and copy it immediately when the dialog is open.'
      );
    }
    throw new Error(`Brevo API error: ${msg}`);
  }

  const result = await response.json();
  return { success: true, messageId: result.messageId };
};

const SENDER = {
  name: 'PlusProtech',
  email: process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'info@plusprotech.com',
};

// Brand colours
const B = '#EC4421';
const BD = '#c93519';

// Reusable HTML building blocks
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PlusProtech</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

        <!-- Logo header -->
        <tr><td style="background:#111111;border-radius:16px 16px 0 0;padding:24px 36px;border-bottom:3px solid ${B};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                ${LOGO_SRC
                  ? `<img src="${LOGO_SRC}" alt="PlusProtech" height="40" style="height:40px;width:auto;display:block;" />`
                  : `<span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-.3px;">Plus<span style="color:${B};">Protech</span></span>`
                }
              </td>
              <td align="right">
                <a href="https://plusprotech.com" style="font-size:11px;color:${B};text-decoration:none;letter-spacing:.05em;">
                  plusprotech.com
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#ffffff;padding:0;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a1a1a;border-radius:0 0 16px 16px;padding:20px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;color:rgba(255,255,255,.4);line-height:1.6;">
                <strong style="color:rgba(255,255,255,.6);">PlusProtech</strong><br>
                1823 7th St, Moline, IL 61265<br>
                <a href="tel:3097627500" style="color:${B};text-decoration:none;">309-762-7500</a> &nbsp;·&nbsp;
                <a href="mailto:info@plusprotech.com" style="color:${B};text-decoration:none;">info@plusprotech.com</a>
              </td>
              <td align="right" style="font-size:11px;color:rgba(255,255,255,.25);">
                Automated email.<br>Please do not reply.
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const infoRow = (label, value) => `
  <tr>
    <td style="padding:9px 0;font-size:13px;color:#6b7280;font-weight:600;width:42%;vertical-align:top;">${label}</td>
    <td style="padding:9px 0;font-size:13px;color:#111;font-weight:500;">${value || 'N/A'}</td>
  </tr>`;

const sectionCard = (rows) => `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f8f9fb;border:1px solid #eaecef;border-radius:10px;padding:20px 22px;margin-bottom:20px;">
    ${rows}
  </table>`;

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Send new-appointment notification email to admin
 */
export const sendAppointmentNotificationToAdmin = async (appointmentData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL not set. Admin notification skipped.');
      return { success: false, message: 'Admin email not configured' };
    }

    const {
      appointment,
      customerName,
      customerEmail,
      customerPhone,
      modelName,
      serviceName,
      appointmentDate,
      appointmentTime,
    } = appointmentData;

    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const body = `
      <!-- Hero -->
      <div style="background:linear-gradient(135deg,#111 0%,#1f1f1f 100%);padding:32px 36px 28px;border-bottom:1px solid #2a2a2a;">
        <span style="display:inline-block;background:${B};color:#fff;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">New Request</span>
        <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-.3px;line-height:1.2;">New Appointment Received</h1>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.5);">Review the details below and confirm the booking.</p>
      </div>

      <!-- Body -->
      <div style="padding:28px 36px 32px;">

        <!-- Appointment details -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Appointment Details</p>
        ${sectionCard(`
          ${infoRow('Title', appointment.title)}
          ${infoRow('Date', formattedDate)}
          ${infoRow('Time', appointmentTime)}
          ${infoRow('Device Model', modelName)}
          ${infoRow('Service', serviceName)}
        `)}

        <!-- Customer details -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Customer Information</p>
        ${sectionCard(`
          ${infoRow('Name', customerName)}
          ${infoRow('Email', customerEmail)}
          ${infoRow('Phone', customerPhone)}
        `)}

        ${appointment.description ? `
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Customer Note</p>
        <div style="background:#fff8f6;border-left:3px solid ${B};border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">${appointment.description}</p>
        </div>` : ''}

      </div>`;

    return await sendViaBrevo({
      sender: SENDER,
      to: [{ email: adminEmail, name: 'PlusProtech Admin' }],
      subject: `New Appointment — ${appointment.title || 'Appointment'}`,
      htmlContent: emailWrapper(body),
      textContent: `New Appointment: ${appointment.title}\nDate: ${formattedDate} at ${appointmentTime}\nModel: ${modelName}\nService: ${serviceName}\nCustomer: ${customerName} | ${customerEmail} | ${customerPhone}`,
    });
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Send repair-completed notification to the customer
 */
export const sendRepairCompletedEmail = async (appointmentData) => {
  try {
    const {
      customerName,
      customerEmail,
      modelName,
      serviceName,
      appointmentTitle,
    } = appointmentData;

    if (!customerEmail) {
      console.warn('No customer email provided. Completion email skipped.');
      return { success: false, message: 'Customer email not available' };
    }

    const body = `
      <!-- Hero banner -->
      <div style="background:linear-gradient(135deg,${B} 0%,${BD} 100%);padding:40px 36px;text-align:center;">
        <!-- Checkmark icon — HTML/CSS only, no emoji, works in all email clients -->
        <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 18px;">
          <tr>
            <td width="72" height="72" align="center" valign="middle"
              style="background:rgba(255,255,255,.2);border-radius:36px;font-size:38px;font-weight:700;
                     color:#fff;line-height:72px;text-align:center;vertical-align:middle;">
              &#10003;
            </td>
          </tr>
        </table>
        <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">Your Device is Ready!</h1>
        <p style="margin:0;font-size:15px;color:rgba(255,255,255,.85);">Your repair has been completed successfully.</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 36px;">

        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
          Hi <strong style="color:#111;">${customerName || 'there'}</strong>,<br><br>
          Great news! Your device has been fully repaired and is now ready for pickup at our store.
          Please visit us at your earliest convenience during business hours.
        </p>

        <!-- Repair summary -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Repair Summary</p>
        ${sectionCard(`
          ${appointmentTitle ? infoRow('Job', appointmentTitle) : ''}
          ${infoRow('Device', modelName)}
          ${infoRow('Service', serviceName)}
          <tr>
            <td style="padding:9px 0;font-size:13px;color:#6b7280;font-weight:600;width:42%;">Status</td>
            <td style="padding:9px 0;">
              <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;padding:3px 12px;border-radius:20px;letter-spacing:.03em;">&#10003; Completed</span>
            </td>
          </tr>
        `)}

        <!-- Visit us -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Pick Up Your Device</p>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fff8f6;border:1px solid #fde1d9;border-radius:10px;margin-bottom:28px;">
          <tr><td style="padding:18px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;">&#128205; <strong>1823 7th St, Moline, IL 61265</strong></td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;">&#128222; <a href="tel:3097627500" style="color:${B};text-decoration:none;font-weight:600;">309-762-7500</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#6b7280;">&#128336; Mon–Sat 9am–7pm &nbsp;·&nbsp; Sun Closed</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;text-align:center;">
          Thank you for choosing PlusProtech — we look forward to seeing you!
        </p>
      </div>`;

    return await sendViaBrevo({
      sender: SENDER,
      to: [{ email: customerEmail, name: customerName || 'Valued Customer' }],
      subject: `Your device is ready for pickup — PlusProtech`,
      htmlContent: emailWrapper(body),
      textContent: `Hi ${customerName || 'there'},\n\nYour device repair is complete and ready for pickup!\n\nDevice: ${modelName}\nService: ${serviceName}\nStatus: Completed\n\nVisit us: PlusProtech, 1823 7th St, Moline, IL 61265\nPhone: 309-762-7500\nHours: Mon–Sat 9am–7pm, Sun Closed\n\nThank you for choosing PlusProtech!`,
    });
  } catch (error) {
    console.error('Failed to send repair completion email:', error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Send appointment confirmation email to the customer after booking
 */
export const sendAppointmentConfirmationToCustomer = async (appointmentData) => {
  try {
    const {
      customerName,
      customerEmail,
      appointmentTitle,
      modelName,
      serviceName,
      appointmentDate,
      appointmentTime,
      price,
    } = appointmentData;

    if (!customerEmail) {
      console.warn('No customer email provided. Confirmation email skipped.');
      return { success: false, message: 'Customer email not available' };
    }

    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Convert 24h time to 12h format for display
    const [rawH, rawM] = (appointmentTime || '').split(':').map(Number);
    const ampm = rawH >= 12 ? 'PM' : 'AM';
    const hour12 = rawH % 12 || 12;
    const formattedTime = `${hour12}:${String(rawM).padStart(2, '0')} ${ampm}`;

    const body = `
      <!-- Hero banner -->
      <div style="background:linear-gradient(135deg,#111 0%,#1f1f1f 100%);padding:36px 36px 28px;border-bottom:1px solid #2a2a2a;">
        <span style="display:inline-block;background:${B};color:#fff;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">Confirmed</span>
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-.3px;line-height:1.2;">Appointment Confirmed!</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,.5);">We've received your booking and look forward to seeing you.</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 36px;">

        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
          Hi <strong style="color:#111;">${customerName || 'there'}</strong>,<br><br>
          Your appointment has been confirmed. Please bring your device on the scheduled date and we'll take care of the rest.
        </p>

        <!-- Appointment details -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Appointment Details</p>
        ${sectionCard(`
          ${appointmentTitle ? infoRow('Title', appointmentTitle) : ''}
          ${infoRow('Device', modelName)}
          ${infoRow('Service', serviceName)}
          ${price ? infoRow('Price', `$${parseFloat(price).toFixed(2)}`) : ''}
          <tr>
            <td style="padding:9px 0;font-size:13px;color:#6b7280;font-weight:600;width:42%;">Date</td>
            <td style="padding:9px 0;font-size:13px;color:#111;font-weight:600;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-size:13px;color:#6b7280;font-weight:600;width:42%;">Time</td>
            <td style="padding:9px 0;font-size:13px;color:#111;font-weight:600;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-size:13px;color:#6b7280;font-weight:600;width:42%;">Status</td>
            <td style="padding:9px 0;">
              <span style="display:inline-block;background:#fef9c3;color:#854d0e;font-size:12px;font-weight:700;padding:3px 12px;border-radius:20px;letter-spacing:.03em;">Confirmed</span>
            </td>
          </tr>
        `)}

        <!-- Visit us -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${B};letter-spacing:.12em;text-transform:uppercase;">Where to Find Us</p>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fff8f6;border:1px solid #fde1d9;border-radius:10px;margin-bottom:28px;">
          <tr><td style="padding:18px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;">&#128205; <strong>1823 7th St, Moline, IL 61265</strong></td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;">&#128222; <a href="tel:3097627500" style="color:${B};text-decoration:none;font-weight:600;">309-762-7500</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#6b7280;">&#128336; Mon–Sat 9am–7pm &nbsp;·&nbsp; Sun Closed</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;text-align:center;">
          Need to reschedule? Call us at <a href="tel:3097627500" style="color:${B};text-decoration:none;">309-762-7500</a> and we'll be happy to help.
        </p>
      </div>`;

    return await sendViaBrevo({
      sender: SENDER,
      to: [{ email: customerEmail, name: customerName || 'Valued Customer' }],
      subject: `Appointment Confirmed — PlusProtech`,
      htmlContent: emailWrapper(body),
      textContent: `Hi ${customerName || 'there'},\n\nYour appointment is confirmed!\n\nDevice: ${modelName}\nService: ${serviceName}\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nVisit us: PlusProtech, 1823 7th St, Moline, IL 61265\nPhone: 309-762-7500\nHours: Mon–Sat 9am–7pm, Sun Closed\n\nThank you for choosing PlusProtech!`,
    });
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
    return { success: false, error: error.message };
  }
};
