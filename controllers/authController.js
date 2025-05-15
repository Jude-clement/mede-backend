const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateToken } = require('../utils/jwt');
const DEFAULT_PROFILE_PIC = 'https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740';

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
  dob: '',
  emailVerified: 0,
  token: ''
});
    }

    // Encrypt the email to match db format
    const encryptedEmail = encrypt(email);
    const user = await User.findByEncryptedEmail(encryptedEmail);

    // Check if user exists
    if (!user) {
return res.status(200).json({
  error: true,
  message: 'Invalid credentials',
  userName: '',
  phoneNumber: '',
  profilePicture: '',
  dob: '',
  emailVerified: 0,
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
return res.status(200).json({
  error: true,
  message: 'Invalid credentials',
  userName: '',
  phoneNumber: '',
  profilePicture: '',
  dob: '',
  emailVerified: 0,
  token: ''
});
    }

        // Check if email is verified
    if (user.emailverified !== 1) {
      return res.status(200).json({
        error: true,
        message: 'Email not verified. Please verify your email to continue.',
        emailVerified: 0,
        // userEmail: email,
        userName: '',
        phoneNumber: '',
        profilePicture: '',
        dob: '',
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
    res.status(200).json({
      error: true,
      message: 'Internal server error',
      userName: '',
      phoneNumber: '',
      profilePicture: '',
      dob: '',
      emailVerified: 0,
      token: ''
    });
  }
};

// google register
exports.googleRegister = async (req, res) => {
  try {
      const { name, email, photoUrl, googleid, deviceToken } = req.body;

      // Validate required fields
      if (!name || !email || !googleid || !deviceToken) {
          return res.status(200).json({
              error: true,
              message: 'Name, email and Google ID are required',
              userName: '',
              phoneNumber: '',
              profilePicture: '',
              dob: '',
              emailVerified: 0,
              deviceToken : '',
          });
      }

      // Create user with Google
      const userId = await User.createWithGoogle({
          name,
          email,
          photoUrl: photoUrl || '',
          googleid,
          deviceToken : deviceToken || '',
      });

      res.status(201).json({
          error: false,
          message: 'Google registration successful',
          userName: name,
          phoneNumber: '',
          profilePicture: photoUrl || '',
          dob: '',
          emailVerified: 1,
          deviceToken : deviceToken,
      });

  } catch (error) {
      console.error('Google registration error:', error);
      res.status(200).json({
          error: true,
          message: error.message || 'Google registration failed',
          userName: '',
          phoneNumber: '',
          profilePicture: '',
          dob: '',
          emailVerified: 0,
          deviceToken : '',
      });
  }
};

////google login  
exports.googleLogin = async (req, res) => {
  try {
    const { googleid, deviceToken = "", name, email, photoUrl } = req.body;

    // Validate required fields
    if (!googleid) {
      return res.status(200).json({
        error: true,
        message: "Google ID is required",
        userName: "",
        profilePicture: "",
        dob: "",
        token: ""
      });
    }

    // Try to find existing user
    let user = await User.findByGoogleId(googleid);

    // If user doesn't exist, register them automatically
    if (!user) {
      // Validate required registration fields
      if (!name || !email) {
        return res.status(200).json({
          error: true,
          message: "Name and email are required for first-time registration",
          userName: "",
          profilePicture: "",
          dob: "",
          token: ""
        });
      }

      // Create new user with Google
      const userId = await User.createWithGoogle({
        name,
        email,
        googleid,
        photoUrl
      });

      // Get the newly created user
      user = await User.findByGoogleId(googleid);
      if (!user) throw new Error("Failed to create new Google user");
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
      profilePicture: user.profilepic || DEFAULT_PROFILE_PIC,
      dob: user.dob || ""
    };

    res.json({
      error: false,
      message: "Google authentication successful",
      ...decryptedUser,
      token
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      error: true,
      message: error.message || "Google authentication failed",
      userName: "",
      profilePicture: "" || DEFAULT_PROFILE_PIC,
      token: ""
    });
  }
};