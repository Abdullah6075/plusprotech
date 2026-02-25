# Brevo Email Integration Setup

This document explains how to set up Brevo (formerly Sendinblue) for sending appointment notification emails to the admin.

## Prerequisites

1. Create a Brevo account at [https://www.brevo.com](https://www.brevo.com)
2. Get your API key from the Brevo dashboard:
   - Go to Settings → API Keys
   - Create a new API key or use an existing one
   - Copy the API key

## Environment Variables

Add the following environment variables to your `.env` file in the `server` directory:

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here

# Admin Email (where appointment notifications will be sent)
ADMIN_EMAIL=admin@yourdomain.com

# Optional: Sender Email (defaults to ADMIN_EMAIL if not set)
BREVO_SENDER_EMAIL=noreply@yourdomain.com
```

## Setup Steps

1. **Get Brevo API Key**:
   - Sign up/login to Brevo
   - Navigate to Settings → API Keys
   - Create a new API key
   - Copy the key

2. **Configure Sender Email**:
   - In Brevo dashboard, go to Senders & IP
   - Add and verify your sender email address
   - This email will be used as the "From" address

3. **Add Environment Variables**:
   - Open `server/.env` file
   - Add the variables as shown above
   - Replace placeholder values with your actual credentials

4. **Restart Server**:
   - Restart your Node.js server for changes to take effect

## How It Works

When a user creates an appointment:
1. The appointment is saved to the database
2. An email notification is automatically sent to the admin email address
3. The email includes:
   - Appointment details (title, date, time, status)
   - Model and service information
   - Customer contact information
   - Appointment description (if provided)

## Email Template

The email is sent in both HTML and plain text formats with:
- Professional black, white, and gray color scheme
- All appointment details clearly formatted
- Customer information section
- Responsive design for mobile viewing

## Troubleshooting

- **Email not sending**: Check that `BREVO_API_KEY` and `ADMIN_EMAIL` are set correctly
- **API errors**: Verify your API key is valid and has transactional email permissions
- **Sender not verified**: Make sure your sender email is verified in Brevo dashboard
- **Check server logs**: Email sending errors are logged but don't break appointment creation

## Notes

- Email sending is non-blocking - if email fails, appointment creation still succeeds
- Check server console logs for email sending status
- Free Brevo accounts have daily sending limits
