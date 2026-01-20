const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    
    // Initialize transporter if credentials exist
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendPasswordReset(to, token) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    const subject = 'Password Reset Request - IRCAMONEY';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">IRCAMONEY</h2>
        <h3>Password Reset Request</h3>
        <p>You requested a password reset for your account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email. This link expires in 10 minutes.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"IRCAMONEY" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to,
          subject,
          html,
        });
        console.log(`Email sent to ${to}`);
      } catch (error) {
        console.error('Email send failed:', error);
        throw new Error('Failed to send email');
      }
    } else {
      console.log('SMTP not configured. Mocking email send.');
      console.log(`To: ${to}`);
      console.log(`Link: ${resetLink}`);
    }
  }
}

module.exports = new EmailService();