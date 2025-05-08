const User = require('../models/userModel');
const { sendVerificationEmail } = require('../utils/emailService');

exports.sendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email (remember to encrypt email for lookup)
    const encryptedEmail = encrypt(email);
    const user = await User.findByEncryptedEmail(encryptedEmail);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    if (user.emailverified) {
      return res.status(400).json({
        error: true,
        message: 'Email already verified'
      });
    }

    // Generate new verification token
    const { token: verificationToken } = generateVerificationToken();
    
    // Update user with new token
    await db.query(
      'UPDATE medusers SET verification_token = ?, verification_expires = ? WHERE user_id = ?',
      [verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000), user.user_id]
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(decrypt(user.email), verificationToken);

    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }

    res.json({
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

    const user = await User.findByVerificationToken(token);

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    await User.verifyEmail(user.user_id);

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