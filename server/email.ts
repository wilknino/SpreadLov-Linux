import nodemailer from 'nodemailer';

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER || 'spreadlov@outlook.com',
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  firstName: string
): Promise<void> {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-icon {
          font-size: 32px;
          color: #667eea;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .code-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code-label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .code {
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .expiry {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px 20px;
          margin: 30px 0;
          border-radius: 6px;
        }
        .expiry-text {
          color: #92400e;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        .security-note {
          background-color: #f3f4f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .security-text {
          color: #4b5563;
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">❤️</span>
          </div>
          <h1 class="header-title">SpreadLov</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${firstName},</p>
          
          <p class="message">
            Welcome to SpreadLov! We're excited to have you join our community. 
            To complete your registration, please verify your email address using the code below:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Verification Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="expiry">
            <p class="expiry-text">
              ⏰ This code will expire in 10 minutes. Please enter it soon to complete your registration.
            </p>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              🔒 <strong>Security Tip:</strong> Never share this code with anyone. SpreadLov will never ask you 
              for this code via phone, email, or any other method outside of the verification page.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">Spread love and connect with amazing people</p>
          <p class="footer-text" style="color: #9ca3af;">© 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || 'spreadlov@outlook.com'}>`,
    to,
    subject: 'Verify Your Email - SpreadLov',
    html: htmlContent,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  firstName: string
): Promise<void> {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-icon {
          font-size: 32px;
          color: #667eea;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .code-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code-label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .code {
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .expiry {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px 20px;
          margin: 30px 0;
          border-radius: 6px;
        }
        .expiry-text {
          color: #92400e;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        .security-note {
          background-color: #f3f4f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .security-text {
          color: #4b5563;
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }
        .alert-box {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .alert-text {
          color: #991b1b;
          font-size: 14px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">❤️</span>
          </div>
          <h1 class="header-title">SpreadLov</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${firstName},</p>
          
          <p class="message">
            We received a request to reset your password. Use the verification code below to set a new password for your account:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Password Reset Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="expiry">
            <p class="expiry-text">
              ⏰ This code will expire in 10 minutes. Please enter it soon to reset your password.
            </p>
          </div>

          <div class="alert-box">
            <p class="alert-text">
              ⚠️ If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              🔒 <strong>Security Tip:</strong> Never share this code with anyone. SpreadLov will never ask you 
              for this code via phone or any other method outside of the password reset page.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">Spread love and connect with amazing people</p>
          <p class="footer-text" style="color: #9ca3af;">© 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || 'spreadlov@outlook.com'}>`,
    to,
    subject: 'Reset Your Password - SpreadLov',
    html: htmlContent,
  });
}

export async function sendAccountDeletionEmail(
  to: string,
  code: string,
  firstName: string
): Promise<void> {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-icon {
          font-size: 32px;
          color: #ef4444;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .code-container {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code-label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .code {
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .expiry {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px 20px;
          margin: 30px 0;
          border-radius: 6px;
        }
        .expiry-text {
          color: #92400e;
          font-size: 14px;
          margin: 0;
        }
        .alert-box {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .alert-text {
          color: #991b1b;
          font-size: 14px;
          margin: 0;
          font-weight: 600;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        .security-note {
          background-color: #f3f4f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .security-text {
          color: #4b5563;
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">⚠️</span>
          </div>
          <h1 class="header-title">Account Deletion Request</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${firstName},</p>
          
          <p class="message">
            We received a request to permanently delete your SpreadLov account. This action cannot be undone. 
            To confirm this deletion, please use the verification code below:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Deletion Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="expiry">
            <p class="expiry-text">
              ⏰ This code will expire in 10 minutes. If you don't complete the deletion within this time, you'll need to request a new code.
            </p>
          </div>

          <div class="alert-box">
            <p class="alert-text">
              🚨 WARNING: Account deletion is permanent and irreversible!
            </p>
            <p style="color: #991b1b; font-size: 13px; margin: 10px 0 0 0;">
              Once confirmed, all your data including profile, messages, photos, and connections will be permanently deleted from our system.
            </p>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              🔒 <strong>Security Tip:</strong> If you didn't request account deletion, please ignore this email and consider changing your password immediately. Your account will remain active.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">We're sorry to see you go</p>
          <p class="footer-text" style="color: #9ca3af;">© 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || 'spreadlov@outlook.com'}>`,
    to,
    subject: 'Account Deletion Verification - SpreadLov',
    html: htmlContent,
  });
}

export async function sendSupportEmail(
  firstName: string,
  lastName: string,
  userEmail: string,
  message: string
): Promise<void> {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-icon {
          font-size: 32px;
          color: #667eea;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .info-section {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 120px;
        }
        .info-value {
          color: #1f2937;
        }
        .message-section {
          background-color: #f3f4f6;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .message-label {
          color: #667eea;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .message-text {
          color: #1f2937;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">💬</span>
          </div>
          <h1 class="header-title">Support & Feedback</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Support Message Received</h2>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value">${firstName} ${lastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${userEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</span>
            </div>
          </div>

          <div class="message-section">
            <div class="message-label">Message</div>
            <div class="message-text">${message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">This is an automated message from SpreadLov Support System</p>
          <p class="footer-text" style="color: #9ca3af;">© 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || 'spreadlov@outlook.com'}>`,
    to: 'spreadlov.aid@gmail.com',
    replyTo: userEmail,
    subject: `Support Request from ${firstName} ${lastName}`,
    html: htmlContent,
  });
}

export async function sendSubscribeEmail(
  to: string,
  unsubscribeToken: string
): Promise<void> {
  const transporter = getEmailTransporter();
  const baseUrl = process.env.BASE_URL || 'https://spreadlov.com';
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-icon {
          font-size: 32px;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome {
          font-size: 24px;
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .benefits {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
        }
        .benefits-title {
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .benefit-item {
          color: #4b5563;
          font-size: 15px;
          margin: 10px 0;
          padding-left: 25px;
          position: relative;
        }
        .benefit-item:before {
          content: "💜";
          position: absolute;
          left: 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 13px;
          margin: 8px 0;
          line-height: 1.5;
        }
        .unsubscribe-link {
          color: #9ca3af;
          font-size: 12px;
          text-decoration: underline;
          margin-top: 15px;
          display: inline-block;
        }
        .social-links {
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">❤️</span>
          </div>
          <h1 class="header-title">SpreadLov</h1>
        </div>
        
        <div class="content">
          <h2 class="welcome">Welcome to SpreadLov! 💕</h2>
          
          <p class="message">
            Thank you for subscribing to our newsletter! We're thrilled to have you join our community of singles looking for meaningful connections.
          </p>
          
          <p class="message">
            You're now part of an exclusive group that will be the first to know about:
          </p>
          
          <div class="benefits">
            <div class="benefits-title">What You'll Receive:</div>
            <div class="benefit-item">Early access to exciting new features</div>
            <div class="benefit-item">Expert dating tips and relationship advice</div>
            <div class="benefit-item">Success stories from our community</div>
            <div class="benefit-item">Exclusive promotions and special offers</div>
            <div class="benefit-item">Updates on events and community activities</div>
          </div>
          
          <p class="message" style="text-align: center;">
            <a href="${baseUrl}" class="cta-button">Visit SpreadLov</a>
          </p>
          
          <p class="message">
            We respect your inbox and promise to only send you valuable content that helps you in your journey to find love.
          </p>
          
          <p class="message" style="color: #9ca3af; font-size: 14px; text-align: center;">
            Questions or feedback? Reply to this email – we'd love to hear from you!
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            <strong>SpreadLov</strong><br>
            Where Real Connections Happen
          </p>
          <p class="footer-text">
            You're receiving this email because you subscribed to SpreadLov updates.
          </p>
          <a href="${unsubscribeUrl}" class="unsubscribe-link">Unsubscribe</a>
          <p class="footer-text" style="color: #9ca3af; margin-top: 20px;">
            © ${new Date().getFullYear()} SpreadLov. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || 'spreadlov@outlook.com'}>`,
    to: to,
    subject: 'Welcome to SpreadLov! 💕',
    html: htmlContent,
  });
}
