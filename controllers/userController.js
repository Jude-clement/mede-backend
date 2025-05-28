const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');
const Account = require('../models/accountModel');
const { sendAccountDeletionOTP } = require('../utils/emailService');
const db = require('../config/db');

exports.signup = async (req, res) => {
  try {
    const { name, phonenumber, email, password } = req.body;

    // Validate input
    if (!name || !phonenumber || !email || !password) {
      return res.status(200).json({
        error: true,
        message: 'All fields are required',
        username: '',
        phonenumber: '',
        profilepicture: '',
        dob: '',
        emailverified: 0
      });
    }

    // Check if user already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(200).json({
        error: true,
        message: 'Email already registered',
        username: '',
        phonenumber: '',
        profilepicture: '',
        dob: '',
        emailverified: 0
      });
    }

    const existingPhone = await User.findByPhone(phonenumber);
    if (existingPhone) {
      return res.status(200).json({
        error: true,
        message: 'Phone number already registered',
        username: '',
        phonenumber: '',
        profilepicture: '',
        dob: '',
        emailverified: 1
      });
    }

    // Create new user
    const userId = await User.create({
      name,
      phonenumber,
      email,
      password
    });

   // Generate and save verification token
    // Generate verification link (email itself is the token when encrypted)
    const verificationToken = encrypt(email); // Reuse encryption utils
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
    // const verificationUrl = `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;

    // Send email (pseudo-code - use your email service)
    await sendVerificationEmail(email, verificationUrl);

    res.status(201).json({
      error: false,
      message: 'User registered. Check your email for verification!',
      username: name,
      phonenumber,
      profilepicture: '',
      dob: '',
      emailverified: 0
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: error.message || 'Registration failed',
      username: '',
      phonenumber: '',
      profilepicture: '',
      dob: '',
      emailverified: 0
    });
  }
};

// Send account deletion OTP
exports.sendAccountCloseOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user email from DB using ID
    const [user] = await db.query(
      'SELECT email FROM medusers WHERE user_id = ?',
      [userId]
    );
    
    if (!user[0]?.email) {
      throw new Error('User email not found');
    }

    const otp = await Account.generateAccountDeletionOTP(userId);
    await sendAccountDeletionOTP(decrypt(user[0].email), otp);

    res.json({ 
      error: false, 
      message: 'OTP sent to your email' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: error.message || 'Failed to send OTP' 
    });
  }
};

// Delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    await Account.verifyAndDeleteAccount(req.user.id, otp);
    
    res.json({ 
      error: false, 
      message: 'Account deactivated successfully' 
    });
  } catch (error) {
    res.status(200).json({ 
      error: true, 
      message: error.message || 'Account deletion failed' 
    });
  }
};

// Reactivate account
// exports.reactivateAccount = async (req, res) => {
//   try {
//     await User.reactivateAccount(req.user.id);
//     res.json({ error: false, message: 'Account reactivated' });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };