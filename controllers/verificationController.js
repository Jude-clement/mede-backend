const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { sendVerificationEmail, generateVerificationToken } = require('../utils/emailService');
const db = require('../config/db');

exports.sendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(200).json({ 
        error: true,
        message: 'Email is required'
      });
    }

    // Encrypt email for lookup (matches how it's stored in DB)
    const encryptedEmail = encrypt(email);
    const user = await User.findByEncryptedEmail(encryptedEmail);

    if (!user) {
      return res.status(200).json({
        error: true,
        message: 'User not found with this email'
      });
    }

    // Check if already verified
    if (user.emailverified === 1) {
      return res.status(200).json({
        error: true,
        message: 'Email is already verified'
      });
    }

    // Generate verification token (using email as base)
    const verificationToken = encrypt(email);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }

    res.status(200).json({
      error: false,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to send verification email'
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Decrypt token to get original email
    const email = decrypt(token);
    const encryptedEmail = encrypt(email);
    
    // Find user by email
    const user = await User.findByEncryptedEmail(encryptedEmail);
    
    if (!user) {
      return res.status(200).json({
        error: true,
        message: 'Invalid verification link'
      });
    }

    if (user.emailverified === 1) {
      return res.status(200).json({
        error: true,
        message: 'Email already verified'
      });
    }

    // Update emailverified status
    await db.query(
      'UPDATE medusers SET emailverified = 1 WHERE user_id = ?',
      [user.user_id]
    );

    res.json({
      error: false,
      message: 'Email verified successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || 'Email verification failed'
    });
  }
};

// exports.resendVerificationEmail = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Validate input
//     if (!email) {
//       return res.status(200).json({ 
//         error: true,
//         message: 'Email is required'
//       });
//     }

//     // Find user by email
//     const encryptedEmail = encrypt(email);
//     const user = await User.findByEncryptedEmail(encryptedEmail);

//     if (!user) {
//       return res.status(404).json({
//         error: true,
//         message: 'User not found with this email'
//       });
//     }

//     // Check if already verified
//     if (user.emailverified === 1) {
//       return res.status(200).json({
//         error: true,
//         message: 'Email is already verified'
//       });
//     }

//     // Generate new verification token
//     const verificationToken = encrypt(email);
//     const emailSent = await sendVerificationEmail(email, verificationToken);

//     if (!emailSent) {
//       throw new Error('Failed to send verification email');
//     }

//     res.status(200).json({
//       error: false,
//       message: 'Verification email resent successfully'
//     });

//   } catch (error) {
//     res.status(500).json({
//       error: true,
//       message: error.message || 'Failed to resend verification email'
//     });
//   }
// };