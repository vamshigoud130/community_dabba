const dns = require('dns').promises;
const nodemailer = require('nodemailer');

/**
 * Validates if the email domain actually exists and has mail exchange (MX) or address (A) records.
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
const validateEmailDomain = async (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Basic Regex Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].trim();

  try {
    // Check for Mail Exchanger records
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // Fallback: check if the domain has A records
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * Sends a transactional email using Brevo (Sendinblue) HTTP API.
 * @param {string} toEmail 
 * @param {string} toName 
 * @param {string} subject 
 * @param {string} htmlContent 
 */
const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  const senderEmail = process.env.SENDER_EMAIL || 'noreply@communitydabba.com';
  const senderName = process.env.SENDER_NAME || 'Community Dabba';

  // 1. Try sending via SMTP if credentials are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: `"${toName}" <${toEmail}>`,
        subject: subject,
        html: htmlContent
      });
      console.log(`✉️ Email successfully sent via SMTP to ${toEmail}. Message ID:`, info.messageId);
      return;
    } catch (smtpError) {
      console.error('❌ Error sending email via SMTP:', smtpError.message);
    }
  }

  // 2. Try sending via Brevo if API key is provided
  const apiKey = process.env.BREVO_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail, name: toName }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✉️ Email successfully sent via Brevo to ${toEmail}. Message ID:`, data.messageId);
        return;
      } else {
        const errText = await response.text();
        console.error(`❌ Brevo API responded with status ${response.status}: ${errText}`);
      }
    } catch (error) {
      console.error('❌ Error sending email via Brevo:', error.message);
    }
  }

  // 3. Fallback: Simulation (Always print OTP/email contents to console so development is unimpeded)
  console.warn('⚠️ Email send simulated (no working SMTP or Brevo config).');
  console.log('========================================================================');
  console.log(`[SIMULATED EMAIL]`);
  console.log(`To: ${toEmail} (${toName})`);
  console.log(`Subject: ${subject}`);
  console.log('Content preview:');
  console.log(htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) + '...');
  // Extract and highlight OTP if it's an OTP email
  const otpMatch = htmlContent.match(/letter-spacing:\s*5px;\s*color:\s*#4F46E5;">(\d+)<\/span>/);
  if (otpMatch && otpMatch[1]) {
    console.log(`🔑 OTP CODE IS: ${otpMatch[1]}`);
  }
  console.log('========================================================================');
};

/**
 * Sends a login notification email.
 */
const sendLoginEmail = async (email, name) => {
  const subject = 'Successful Login Alert - Community Dabba';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4F46E5; text-align: center;">Security Alert: Successful Login</h2>
      <p>Hello ${name},</p>
      <p>This is a quick security notification to let you know that you have successfully logged into your <strong>Community Dabba</strong> account.</p>
      <p>If this was you, no action is required. If you did not log in or believe this was unauthorized, please change your password immediately.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">This is an automated security message from Community Dabba.</p>
    </div>
  `;
  await sendEmail(email, name, subject, htmlContent);
};

/**
 * Sends an order placement confirmation email.
 */
const sendOrderPlacedEmail = async (email, name, order) => {
  const subject = `Order Placed Successfully! - #${order._id.toString().slice(-6)}`;
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #10B981; text-align: center;">Order Confirmed!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for ordering with Community Dabba! Your order has been placed successfully and is being prepared.</p>
      
      <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #374151;">Order Summary (ID: #${order._id.toString().slice(-6)})</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        <div style="margin-top: 15px; text-align: right; font-weight: bold; font-size: 16px;">
          Grand Total: ₹${order.total}
        </div>
      </div>

      <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">Enjoy your delicious meal! - The Community Dabba Team</p>
    </div>
  `;
  await sendEmail(email, name, subject, htmlContent);
};

/**
 * Sends subscription activation confirmation email.
 */
const sendSubscriptionEmail = async (email, name, subscription) => {
  const subject = `Subscription Activated! - ${subscription.plan} Plan`;
  const formattedEndDate = new Date(subscription.endDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6366F1; text-align: center;">Subscription Active! 🎉</h2>
      <p>Hello ${name},</p>
      <p>You have successfully subscribed to the <strong>${subscription.plan} Meal Plan</strong> with Community Dabba!</p>
      
      <div style="background-color: #F5F3FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #5B21B6;">Plan Details</h4>
        <p><strong>Plan Duration:</strong> ${subscription.plan}</p>
        <p><strong>Meal Plan Customization:</strong> ${subscription.mealTypes.join(' + ')}</p>
        <p><strong>Price Paid:</strong> ₹${subscription.pricePaid}</p>
        <p><strong>Valid Until:</strong> ${formattedEndDate}</p>
      </div>

      <p>Your subscription is now active. You will receive fresh, hygienic meals according to your selection. You can pause or skip days from your customer dashboard whenever you want.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">Welcome to the family! - The Community Dabba Team</p>
    </div>
  `;
  await sendEmail(email, name, subject, htmlContent);
};

/**
 * Sends an order out-for-delivery alert email.
 */
const sendOutOfDeliveryEmail = async (email, name, orderId) => {
  const subject = `Your Order is Out for Delivery! 🛵`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #F59E0B; text-align: center;">Out for Delivery!</h2>
      <p>Hello ${name},</p>
      <p>Great news! Your delicious meal from Community Dabba is out for delivery.</p>
      <p>Our delivery executive is on the way. Please make sure someone is available at your delivery address to receive it.</p>
      
      <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <strong style="color: #92400E; font-size: 16px;">Order ID: #${orderId.toString().slice(-6)}</strong>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">Get ready to enjoy your meal! - The Community Dabba Team</p>
    </div>
  `;
  await sendEmail(email, name, subject, htmlContent);
};

/**
 * Sends order delivery confirmation email.
 */
const sendOrderDeliveredEmail = async (email, name, orderId) => {
  const subject = `Order Delivered! Bon Appétit 😋`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #10B981; text-align: center;">Delivered!</h2>
      <p>Hello ${name},</p>
      <p>Your order <strong>#${orderId.toString().slice(-6)}</strong> has been successfully delivered.</p>
      <p>We hope you enjoy your meal! If you have any feedback, please log into your account and submit feedback so we can continue to improve.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">Thank you for dining with us! - The Community Dabba Team</p>
    </div>
  `;
  await sendEmail(email, name, subject, htmlContent);
};

/**
 * Sends a registration OTP verification email.
 */
const sendOTPEmail = async (email, name, otp) => {
  const subject = 'Verify Your Email Address - Community Dabba';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4F46E5; text-align: center;">Verify Your Email</h2>
      <p>Hello ${name},</p>
      <p>Thank you for signing up with Community Dabba! To complete your registration, please verify your email address by entering the following One-Time Password (OTP):</p>
      
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">${otp}</span>
      </div>
      
      <p>This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">This is an automated security message from Community Dabba.</p>
    </div>
  `;
  await sendEmail(email, name, subject, htmlContent);
};

module.exports = {
  validateEmailDomain,
  sendLoginEmail,
  sendOrderPlacedEmail,
  sendSubscriptionEmail,
  sendOutOfDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOTPEmail
};
