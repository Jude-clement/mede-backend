const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');
exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const encryptedEmail = encrypt(email);
    const user = await User.findByEncryptedEmail(encryptedEmail);
    
    if (!user) {
      return res.status(200).json({
        error: true,
        message: 'User not found'
      });
    }

    // Generate reset token (using encrypted email)
    const resetToken = encrypt(email + Date.now()); // Unique token
    
    // Send email with reset link
    const resetUrl = `${process.env.BASE_URL}/api/pass/reset-password/confirm?token=${encodeURIComponent(resetToken)}`;
    // const resetUrl = `/api/pass/reset-password/confirm?token=${encodeURIComponent(resetToken)}`;
 
    await sendPasswordResetEmail(email, resetUrl);

    res.json({
      error: false,
      message: 'We have sent a reset password email to the address associated with your account. Follow the instructions in the email to reset your password.'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || 'There seems to be an issue with your email address. Please try again.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // const { token, newPassword, confirmPassword } = req.body;
    // Get token from query params and passwords from form data
    // const { token } = req.query;
    // const { newPassword, confirmPassword } = req.body;
  const { token, newPassword, confirmPassword } = req.body; // Now from POST body

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        error: true,
        message: 'Passwords do not match'
      });
    }

    // Decrypt token to get email
    const decrypted = decrypt(token);
    const email = decrypted.replace(/\d+$/, ''); // Remove timestamp
    const encryptedEmail = encrypt(email);

    // Find user
    const user = await User.findByEncryptedEmail(encryptedEmail);
    if (!user) {
      return res.status(200).json({
        error: true,
        message: 'Invalid reset link'
      });
    }

    // Update password
    await User.updatePassword(user.user_id, newPassword);

    res.json({
      error: false,
      message: 'Password updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || 'Password reset failed'
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldpassword, newpassword } = req.body;

    // Validate input
    if (!oldpassword || !newpassword) {
      return res.status(200).json({
        error: true,
        message: 'Both old and new passwords are required'
      });
    }

    if (oldpassword === newpassword) {
      return res.status(200).json({
        error: true,
        message: 'New password must be different from current password'
      });
    }

    // Add password strength validation if needed
    if (newpassword.length < 8) {
      return res.status(200).json({
        error: true,
        message: 'Password must be at least 8 characters long'
      });
    }

    await User.changePassword(userId, oldpassword, newpassword);

    res.status(200).json({
      error: false,
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message || 'Failed to change password'
    });
  }
};