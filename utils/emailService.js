const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate a secure random token (32 bytes)
function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expires };
}

// Send verification email
async function sendVerificationEmail(email, token) {
  // Ensure token is only the encrypted string, not a full URL
  const cleanToken = token.includes('?token=') 
    ? token.split('?token=')[1] 
    : token;
  
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(cleanToken)}`;
  // const verificationUrl = `/api/auth/verify-email?token=${encodeURIComponent(cleanToken)}`;

  const mailOptions = {
    from: `"Med" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    cc: 'syagin@qawebprints.com', // CC email

    subject: 'Verify Your Email',
    html: `
      <p>Click this link to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Link expires in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

// Password reset
async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: `"Med" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    cc: 'syagin@qawebprints.com', // CC email

    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to proceed:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
}

// --- NEW: Account Deletion OTP Email ---
async function sendAccountDeletionOTP(email, otp) {
  console.log('Sending OTP ', email, otp);
  const mailOptions = {
    from: `"Med" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    cc: 'syagin@qawebprints.com', // Keep CC if needed
    subject: 'Confirm Account Deletion',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d9534f;">MedE Account Deletion Request</h2>
        <p>You requested to delete your account. Use this OTP to confirm:</p>
        <div style="background: #f8f9fa; padding: 10px; margin: 15px 0; text-align: center;">
          <strong style="font-size: 24px; letter-spacing: 2px;">${otp}</strong>
        </div>
        <p style="color: #6c757d;"><em>This OTP expires in 5 minutes.</em></p>
        <p>If you didn't request this, please secure your account immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Account deletion OTP email error:', error);
    return false;
  }
}

module.exports = { generateVerificationToken, sendVerificationEmail,sendPasswordResetEmail,sendAccountDeletionOTP  };