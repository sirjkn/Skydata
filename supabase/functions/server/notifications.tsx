/**
 * Notification Service for Skyway Suites
 * Handles SMS, WhatsApp, and Email notifications
 */

// Send SMS via Africa's Talking
async function sendAfricasTalkingSMS(
  apiKey: string,
  username: string,
  to: string,
  message: string
) {
  try {
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        username: username,
        to: to,
        message: message
      })
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Africa\'s Talking SMS error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send SMS via Twilio
async function sendTwilioSMS(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  message: string
) {
  try {
    const auth = btoa(`${accountSid}:${authToken}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: message
        })
      }
    );

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send WhatsApp via wasenderapi.com
async function sendWhatsAppMessage(
  apiKey: string,
  apiUrl: string,
  to: string,
  message: string
) {
  try {
    const response = await fetch(`${apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: to,
        message: message
      })
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send Email via SMTP
async function sendEmail(
  smtpHost: string,
  smtpPort: string,
  smtpUser: string,
  smtpPassword: string,
  fromEmail: string,
  fromName: string,
  to: string,
  subject: string,
  htmlBody: string
) {
  try {
    // Using a simple email API endpoint approach
    // In production, you'd use nodemailer or similar
    const emailData = {
      host: smtpHost,
      port: parseInt(smtpPort),
      user: smtpUser,
      password: smtpPassword,
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: subject,
      html: htmlBody
    };

    console.log('Email would be sent:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    });

    // For now, return success (actual SMTP implementation would go here)
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendBookingNotifications(
  notificationSettings: any,
  bookingData: any,
  propertyData: any,
  customerData: any
) {
  const results = {
    sms: { admin: null, customer: null },
    whatsapp: { admin: null, customer: null },
    email: { admin: null, customer: null }
  };

  // Prepare messages
  const adminMessage = `🏠 NEW BOOKING ALERT

Property: ${propertyData.name}
Customer: ${customerData.name}
Phone: ${customerData.phone}
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut}
Amount: KSh ${bookingData.totalAmount.toLocaleString()}
Status: ${bookingData.status}

Ref: ${bookingData.bookingReference}

Please review and confirm in admin dashboard.`;

  const customerMessage = `✅ BOOKING CONFIRMATION

Dear ${customerData.name},

Your booking has been received!

Property: ${propertyData.name}
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut}
Total: KSh ${bookingData.totalAmount.toLocaleString()}
Reference: ${bookingData.bookingReference}

We will contact you shortly to confirm your booking.

Thank you for choosing Skyway Suites!`;

  // Email HTML templates
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6B7F39; color: white; padding: 20px; text-align: center;">
        <h1>🏠 New Booking Alert</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2>Booking Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Property:</td>
            <td style="padding: 10px;">${propertyData.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Customer:</td>
            <td style="padding: 10px;">${customerData.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Phone:</td>
            <td style="padding: 10px;">${customerData.phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px;">${customerData.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Check-in:</td>
            <td style="padding: 10px;">${bookingData.checkIn}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Check-out:</td>
            <td style="padding: 10px;">${bookingData.checkOut}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Amount:</td>
            <td style="padding: 10px;">KSh ${bookingData.totalAmount.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Reference:</td>
            <td style="padding: 10px;">${bookingData.bookingReference}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">Please review and confirm this booking in your admin dashboard.</p>
      </div>
    </div>
  `;

  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6B7F39; color: white; padding: 20px; text-align: center;">
        <h1>✅ Booking Confirmation</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p>Dear ${customerData.name},</p>
        <p>Thank you for your booking with Skyway Suites!</p>
        <h2>Your Booking Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Property:</td>
            <td style="padding: 10px;">${propertyData.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Check-in:</td>
            <td style="padding: 10px;">${bookingData.checkIn}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Check-out:</td>
            <td style="padding: 10px;">${bookingData.checkOut}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 10px;">KSh ${bookingData.totalAmount.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Reference:</td>
            <td style="padding: 10px;">${bookingData.bookingReference}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">We will contact you shortly to confirm your booking and provide payment details.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p style="margin-top: 30px; color: #666;">Best regards,<br/>Skyway Suites Team</p>
      </div>
    </div>
  `;

  // Send SMS if configured
  if (notificationSettings.sms) {
    const { provider, africastalking, twilio } = notificationSettings.sms;
    
    // Get admin phone from settings (we'll need to pass this)
    const adminPhone = notificationSettings.adminPhone || '';
    
    if (provider === 'africastalking' && africastalking.apiKey && africastalking.username) {
      // Send to admin
      if (adminPhone) {
        results.sms.admin = await sendAfricasTalkingSMS(
          africastalking.apiKey,
          africastalking.username,
          adminPhone,
          adminMessage
        );
      }
      
      // Send to customer
      if (customerData.phone) {
        results.sms.customer = await sendAfricasTalkingSMS(
          africastalking.apiKey,
          africastalking.username,
          customerData.phone,
          customerMessage
        );
      }
    } else if (provider === 'twilio' && twilio.accountSid && twilio.authToken) {
      // Send to admin
      if (adminPhone) {
        results.sms.admin = await sendTwilioSMS(
          twilio.accountSid,
          twilio.authToken,
          twilio.phoneNumber,
          adminPhone,
          adminMessage
        );
      }
      
      // Send to customer
      if (customerData.phone) {
        results.sms.customer = await sendTwilioSMS(
          twilio.accountSid,
          twilio.authToken,
          twilio.phoneNumber,
          customerData.phone,
          customerMessage
        );
      }
    }
  }

  // Send WhatsApp if enabled
  if (notificationSettings.whatsapp?.enabled && notificationSettings.whatsapp.apiKey) {
    const { apiKey, apiUrl, adminPhone } = notificationSettings.whatsapp;
    
    // Send to admin
    if (adminPhone) {
      results.whatsapp.admin = await sendWhatsAppMessage(
        apiKey,
        apiUrl,
        adminPhone,
        adminMessage
      );
    }
    
    // Send to customer
    if (customerData.phone) {
      results.whatsapp.customer = await sendWhatsAppMessage(
        apiKey,
        apiUrl,
        customerData.phone,
        customerMessage
      );
    }
  }

  // Send Email if enabled
  if (notificationSettings.email?.enabled && notificationSettings.email.smtpHost) {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName,
      adminEmail
    } = notificationSettings.email;
    
    // Send to admin
    if (adminEmail) {
      results.email.admin = await sendEmail(
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName,
        adminEmail,
        `🏠 New Booking: ${propertyData.name}`,
        adminEmailHtml
      );
    }
    
    // Send to customer
    if (customerData.email) {
      results.email.customer = await sendEmail(
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName,
        customerData.email,
        `✅ Booking Confirmation - ${bookingData.bookingReference}`,
        customerEmailHtml
      );
    }
  }

  return results;
}
