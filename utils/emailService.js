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
  
  // const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${encodeURIComponent(cleanToken)}`;
  const verificationUrl = `/api/verify-email?token=${encodeURIComponent(cleanToken)}`;

  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_FROM_EMAIL}>`,
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
    from: `"Your App" <${process.env.SMTP_FROM_EMAIL}>`,
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

module.exports = { generateVerificationToken, sendVerificationEmail,sendPasswordResetEmail };