const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');

exports.signup = async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;

    // Validate input
    if (!name || !phoneNumber || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        error: true,
        message: 'Email already registered'
      });
    }

    const existingPhone = await User.findByPhone(phoneNumber);
    if (existingPhone) {
      return res.status(400).json({
        error: true,
        message: 'Phone number already registered'
      });
    }

    // Create new user
    const userId = await User.create({
      name,
      phoneNumber,
      email,
      password
    });

    res.status(201).json({
      error: false,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};