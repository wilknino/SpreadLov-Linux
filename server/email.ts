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
