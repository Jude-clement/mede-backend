const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateToken } = require('../utils/jwt');

exports.login = async (req, res) => {
  try {
    const { email, password, devicetoken } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(200).json({
        error: true,
        message: 'Email and password are required',
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        token: ''
      });
    }

    // Encrypt the email to match db format
    const encryptedEmail = encrypt(email);
    const user = await User.findByEncryptedEmail(encryptedEmail);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials',
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        token: ''
      });
    }

    // Decrypt ALL stored user data for validation
    const decryptedUser = {
      email: decrypt(user.email),
      password: decrypt(user.password),
      userName: decrypt(user.userfullname),
      phoneNumber: decrypt(user.mobileno)
    };

    // Validate credentials against decrypted data
    if (email !== decryptedUser.email || password !== decryptedUser.password) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials',
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        token: ''
      });
    }

    // Handle device token
    if (devicetoken) {
      const currentTokens = user.devicetoken ? user.devicetoken.split(',') : [];
      
      // Only add if token doesn't exist
      if (!currentTokens.includes(devicetoken)) {
        const updatedTokens = [...currentTokens, devicetoken].join(',');
        await User.updateDeviceToken(user.user_id, updatedTokens);
      }
    }

    // Generate JWT token
    const token = generateToken(user.user_id);

    // Prepare response with decrypted data
    res.json({
      error: false,
      message: 'Login successful',
      userName: decryptedUser.userName,
      phoneNumber: decryptedUser.phoneNumber,
      profilePicture: user.profilepic || '',
      dob: user.dob || '',
      emailVerified: user.emailverified,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      userName: '',
      phoneNumber: '',
      profilePicture: '',
      token: ''
    });
  }
};

// google register
exports.googleRegister = async (req, res) => {
  try {
      const { name, phoneNumber,email, photoUrl, googleid } = req.body;

      // Validate required fields
      if (!name || !email || !googleid) {
          return res.status(200).json({
              error: true,
              message: 'Name, email and Google ID are required'
          });
      }

      // Create user with Google
      const userId = await User.createWithGoogle({
          name,
          phoneNumber: phoneNumber || '',
          email,
          photoUrl: photoUrl || '',
          googleid
      });

      res.status(201).json({
          error: false,
          message: 'Google registration successful'
      });

  } catch (error) {
      console.error('Google registration error:', error);
      res.status(200).json({
          error: true,
          message: error.message || 'Google registration failed'
      });
  }
};

////google login  
exports.googleLogin = async (req, res) => {
  try {
      const { googleid, deviceToken = "" } = req.body;

      // Validate required fields
      if (!googleid) {
          return res.status(200).json({
              error: true,
              message: "Google ID is required",
              userName: "",
              phoneNumber: "",
              profilePicture: "",
              dob: "",
              token: ""
          });
      }

      // Find user by Google ID
      const user = await User.findByGoogleId(googleid);
      if (!user) {
          return res.status(404).json({
              error: true,
              message: "Google account not registered",
              userName: "",
              phoneNumber: "",
              profilePicture: "",
              token: ""
          });
      }

      // Update device tokens if provided
      if (deviceToken) {
          await User.updateDeviceTokens(user.user_id, deviceToken);
      }

      // Generate JWT token
      const token = generateToken(user.user_id);

      // Decrypt user data for response
      const decryptedUser = {
          userName: decrypt(user.userfullname),
          phoneNumber: user.mobileno ? decrypt(user.mobileno) : "",
          profilePicture: user.profilepic || ""
      };

      res.json({
          error: false,
          message: "Google login successful",
          ...decryptedUser,
          token
      });

  } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({
          error: true,
          message: error.message || "Google login failed",
          userName: "",
          phoneNumber: "",
          profilePicture: "",
          token: ""
      });
  }
};