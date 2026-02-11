const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
    },
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - DreamHome',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 DreamHome</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with DreamHome! To complete your registration, please verify your email address.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Never share this code with anyone</li>
                  <li>DreamHome will never ask for your OTP via phone or email</li>
                  <li>This code expires in 10 minutes</li>
                </ul>
              </div>

              <p>If you didn't request this verification, please ignore this email.</p>
              
              <p>Best regards,<br><strong>The DreamHome Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send Welcome Email (after verification)
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();

    const roleMessage = role === 'seller' 
      ? 'You can now start listing your properties and connect with potential buyers.'
      : 'You can now browse and inquire about properties that match your needs.';

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to DreamHome! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .success-icon {
              font-size: 60px;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Welcome to DreamHome!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Congratulations, ${name}!</h2>
              <p>Your email has been successfully verified and your account is now active.</p>
              
              <p>${roleMessage}</p>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">
                  Get Started
                </a>
              </div>

              <h3>What's Next?</h3>
              <ul>
                ${role === 'seller' ? `
                  <li>Complete your seller profile</li>
                  <li>Upload your first property listing</li>
                  <li>Connect with potential buyers</li>
                ` : `
                  <li>Browse available properties</li>
                  <li>Save your favorite listings</li>
                  <li>Contact sellers directly</li>
                `}
              </ul>

              <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
              
              <p>Happy house hunting!<br><strong>The DreamHome Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send Password Reset OTP Email
const sendPasswordResetOTP = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - DreamHome',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              border: 2px dashed #f5576c;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #f5576c;
              letter-spacing: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #ffe5e5;
              border-left: 4px solid #f5576c;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
              <p>DreamHome Security</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password. Use the verification code below to proceed with resetting your password.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your password reset code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>

              <div class="info-box">
                <strong>ℹ️ What happens next?</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Enter this code on the password reset page</li>
                  <li>Create your new password</li>
                  <li>Login with your new credentials</li>
                </ol>
              </div>

              <div class="warning">
                <strong>⚠️ Security Warning:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Never share this code with anyone</li>
                  <li>DreamHome staff will never ask for your OTP</li>
                  <li>If you didn't request this, please ignore this email and your password will remain unchanged</li>
                  <li>Consider changing your password if you suspect unauthorized access</li>
                </ul>
              </div>

              <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
              
              <p>Best regards,<br><strong>The DreamHome Security Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
              <p>This is an automated security email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password Reset OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    throw error;
  }
};

// Send Password Changed Confirmation Email
const sendPasswordChangedConfirmation = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Successfully Changed - DreamHome',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .success-icon {
              font-size: 60px;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box {
              background: #e8f5e9;
              border-left: 4px solid #4caf50;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              background: #4caf50;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed Successfully</h1>
              <p>DreamHome Security</p>
            </div>
            <div class="content">
              <div class="success-icon">🔒</div>
              <h2>Hello ${name},</h2>
              <p>Your password has been successfully changed. You can now login with your new password.</p>
              
              <div class="info-box">
                <strong>✓ What changed?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Your password has been updated</li>
                  <li>All devices remain logged in</li>
                  <li>Your account security has been enhanced</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" class="cta-button">
                  Login to Your Account
                </a>
              </div>

              <div class="warning">
                <strong>⚠️ Didn't make this change?</strong>
                <p style="margin: 10px 0 0 0;">
                  If you did not change your password, please contact our support team immediately at 
                  <strong>${process.env.SUPPORT_EMAIL || 'support@dreamhome.com'}</strong>. 
                  Your account security may be compromised.
                </p>
              </div>

              <h3>Security Tips:</h3>
              <ul>
                <li>Never share your password with anyone</li>
                <li>Use a unique password for DreamHome</li>
                <li>Enable two-factor authentication (coming soon)</li>
                <li>Update your password regularly</li>
              </ul>

              <p>Thank you for keeping your account secure!</p>
              
              <p>Best regards,<br><strong>The DreamHome Security Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
              <p>This is an automated security notification. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password Changed Confirmation Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password changed confirmation email:', error);
    throw error;
  }
};

// Send Inquiry Notification to Seller
const sendInquiryNotification = async (sellerEmail, sellerName, inquiryData) => {
  try {
    const transporter = createTransporter();

    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerProfession,
      propertyTitle,
      propertyAddress,
      propertyPrice,
    } = inquiryData;

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject: `New Inquiry for Your Property - ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #b04439 0%, #8f3730 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .inquiry-box {
              background: white;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .property-info {
              background: #fff3f2;
              border-left: 4px solid #b04439;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .buyer-details {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
            }
            .detail-row {
              display: flex;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #666;
              width: 120px;
              flex-shrink: 0;
            }
            .detail-value {
              color: #333;
              flex: 1;
            }
            .cta-button {
              display: inline-block;
              background: #b04439;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .notice {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🔔</div>
              <h1>New Property Inquiry</h1>
              <p>Someone is interested in your property!</p>
            </div>
            <div class="content">
              <h2>Hello ${sellerName},</h2>
              <p>Great news! You have received a new inquiry for one of your property listings.</p>
              
              <div class="property-info">
                <strong>📍 Property Details:</strong>
                <div style="margin-top: 10px;">
                  <div><strong>Title:</strong> ${propertyTitle}</div>
                  <div><strong>Address:</strong> ${propertyAddress}</div>
                  <div><strong>Price:</strong> ${propertyPrice}</div>
                </div>
              </div>

              <h3 style="margin-top: 30px;">👤 Buyer Information:</h3>
              <div class="buyer-details">
                <div class="detail-row">
                  <div class="detail-label">Full Name:</div>
                  <div class="detail-value">${buyerName}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Email:</div>
                  <div class="detail-value"><a href="mailto:${buyerEmail}" style="color: #b04439; text-decoration: none;">${buyerEmail}</a></div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Phone:</div>
                  <div class="detail-value"><a href="tel:${buyerPhone}" style="color: #b04439; text-decoration: none;">${buyerPhone}</a></div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Profession:</div>
                  <div class="detail-value">${buyerProfession}</div>
                </div>
              </div>

              <div class="notice">
                <strong>📋 Next Steps:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Log in to your DreamHome account</li>
                  <li>Review the buyer's complete profile and identity proof</li>
                  <li>Accept or decline the inquiry with a reason</li>
                  <li>If accepted, your contact details will be shared with the buyer</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/manage-inquiries" class="cta-button">
                  View & Respond to Inquiry
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>⏰ Time-sensitive:</strong> Buyers appreciate quick responses. 
                Responding within 24 hours increases your chances of successful connections.
              </p>

              <p>Good luck with your property sale!</p>
              
              <p>Best regards,<br><strong>The DreamHome Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
              <p>This is an automated notification. You can manage your email preferences in your account settings.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry Notification Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending inquiry notification email:', error);
    throw error;
  }
};

// Send Inquiry Status Update to Buyer (Accepted)
const sendInquiryAcceptedEmail = async (buyerEmail, buyerName, inquiryData) => {
  try {
    const transporter = createTransporter();

    const {
      propertyTitle,
      propertyAddress,
      sellerName,
      sellerEmail,
      sellerPhone,
    } = inquiryData;

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `✅ Your Inquiry Accepted - ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .success-icon {
              font-size: 60px;
              text-align: center;
              margin: 20px 0;
            }
            .property-info {
              background: #e8f5e9;
              border-left: 4px solid #4caf50;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .contact-box {
              background: white;
              border: 2px solid #4caf50;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .contact-detail {
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .contact-detail:last-child {
              border-bottom: none;
            }
            .cta-button {
              display: inline-block;
              background: #4caf50;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 5px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .tips {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Inquiry Accepted!</h1>
              <p>The seller wants to connect with you</p>
            </div>
            <div class="content">
              <h2>Great News, ${buyerName}!</h2>
              <p>The property owner has accepted your inquiry and is interested in discussing the property with you.</p>
              
              <div class="property-info">
                <strong>📍 Property Details:</strong>
                <div style="margin-top: 10px;">
                  <div><strong>Title:</strong> ${propertyTitle}</div>
                  <div><strong>Address:</strong> ${propertyAddress}</div>
                </div>
              </div>

              <h3 style="margin-top: 30px;">📞 Seller Contact Information:</h3>
              <div class="contact-box">
                <div class="contact-detail">
                  <strong>Name:</strong> ${sellerName}
                </div>
                <div class="contact-detail">
                  <strong>Email:</strong> <a href="mailto:${sellerEmail}" style="color: #4caf50; text-decoration: none;">${sellerEmail}</a>
                </div>
                <div class="contact-detail">
                  <strong>Phone:</strong> <a href="tel:${sellerPhone}" style="color: #4caf50; text-decoration: none;">${sellerPhone}</a>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${sellerEmail}" class="cta-button">
                  📧 Send Email
                </a>
                <a href="tel:${sellerPhone}" class="cta-button">
                  📱 Call Now
                </a>
              </div>

              <div class="tips">
                <strong>💡 Tips for Your Conversation:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Schedule a property viewing at your convenience</li>
                  <li>Prepare your questions about the property</li>
                  <li>Discuss payment terms and documentation</li>
                  <li>Verify all property documents before proceeding</li>
                  <li>Be professional and respectful in all communications</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">We wish you the best in finding your dream home!</p>
              
              <p>Best regards,<br><strong>The DreamHome Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
              <p>This is an automated notification.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry Accepted Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending inquiry accepted email:', error);
    throw error;
  }
};

// Send Inquiry Status Update to Buyer (Declined)
const sendInquiryDeclinedEmail = async (buyerEmail, buyerName, inquiryData) => {
  try {
    const transporter = createTransporter();

    const {
      propertyTitle,
      propertyAddress,
      declineReason,
    } = inquiryData;

    const mailOptions = {
      from: `"DreamHome" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `Inquiry Update - ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .property-info {
              background: #fff3e0;
              border-left: 4px solid #ff9800;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .reason-box {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: #b04439;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .encouragement {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Inquiry Status Update</h1>
              <p>Property Inquiry Response</p>
            </div>
            <div class="content">
              <h2>Hello ${buyerName},</h2>
              <p>Thank you for your interest in the property. Unfortunately, the seller has declined your inquiry at this time.</p>
              
              <div class="property-info">
                <strong>📍 Property Details:</strong>
                <div style="margin-top: 10px;">
                  <div><strong>Title:</strong> ${propertyTitle}</div>
                  <div><strong>Address:</strong> ${propertyAddress}</div>
                </div>
              </div>

              <h3 style="margin-top: 30px;">Seller's Response:</h3>
              <div class="reason-box">
                <p style="margin: 0; color: #666;">${declineReason}</p>
              </div>

              <div class="encouragement">
                <strong>🏠 Don't Give Up!</strong>
                <p style="margin: 10px 0 0 0;">
                  There are many other great properties available on DreamHome. 
                  Keep searching and you'll find the perfect home for you!
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/properties" class="cta-button">
                  Browse More Properties
                </a>
              </div>

              <p style="margin-top: 30px;">We're here to help you find your dream home. Keep exploring!</p>
              
              <p>Best regards,<br><strong>The DreamHome Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 DreamHome. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry Declined Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending inquiry declined email:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetOTP,
  sendPasswordChangedConfirmation,
  sendInquiryNotification,
  sendInquiryAcceptedEmail,
  sendInquiryDeclinedEmail,
};