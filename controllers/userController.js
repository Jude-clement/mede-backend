const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;

    // Validate input
    if (!name || !phoneNumber || !email || !password) {
      return res.status(200).json({
        error: true,
        message: 'All fields are required',
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        dob: '',
        emailVerified: 0
      });
    }

    // Check if user already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(200).json({
        error: true,
        message: 'Email already registered',
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        dob: '',
        emailVerified: 0
      });
    }

    const existingPhone = await User.findByPhone(phoneNumber);
    if (existingPhone) {
      return res.status(200).json({
        error: true,
        message: 'Phone number already registered',
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        dob: '',
        emailVerified: 1
      });
    }

    // Create new user
    const userId = await User.create({
      name,
      phoneNumber,
      email,
      password
    });

   // Generate and save verification token
    // Generate verification link (email itself is the token when encrypted)
    const verificationToken = encrypt(email); // Reuse encryption utils
    // const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${verificationToken}`;
    const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${encodeURIComponent(verificationToken)}`;

    // Send email (pseudo-code - use your email service)
    await sendVerificationEmail(email, verificationUrl);

    res.status(201).json({
      error: false,
      message: 'User registered. Check your email for verification!',
      userName: name,
      phoneNumber,
      profilePicture: '',
      dob: '',
      emailVerified: 0
    });

  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: error.message || 'Registration failed',
      userName: '',
      phoneNumber: '',
      profilePicture: '',
      dob: '',
      emailVerified: 0
    });
  }
};