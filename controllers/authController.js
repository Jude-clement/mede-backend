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
  username: '',
  phonenumber: '',
  profilepicture: '',
  dob: '',
  emailverified: 0,
  patientlocation: '',
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
  username: '',
  phonenumber: '',
  profilepicture: '',
  dob: '',
  emailverified: 0,
  patientlocation: '',
  token: ''
});
    }

    // Decrypt ALL stored user data for validation
    const decryptedUser = {
      email: decrypt(user.email),
      password: decrypt(user.password),
      username: decrypt(user.userfullname),
      phonenumber: decrypt(user.mobileno)
    };

    // Validate credentials against decrypted data
    if (email !== decryptedUser.email || password !== decryptedUser.password) {
return res.status(200).json({
  error: true,
  message: 'Invalid credentials',
  username: '',
  phonenumber: '',
  profilepicture: '',
  dob: '',
  emailverified: 0,
  patientlocation: '',
  token: ''
});
    }

        // Check if email is verified
    if (user.emailverified !== 1) {
      return res.status(200).json({
        error: false,
        message: 'Please verify your email address to continue. We have sent a verification link to your inbox. Check your email and tap the link to activate your account.',
        emailverified: 0,
        // userEmail: email,
        username: '',
        phonenumber: '',
        profilepicture: '',
        patientlocation: '',
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
      message: 'Login successfull',
      username: decryptedUser.username,
      phonenumber: decryptedUser.phonenumber,
      profilepicture: user.profilepic || '',
      dob: user.dob || '',
      emailverified: user.emailverified,
      patientlocation: user.patientlocation,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(200).json({
      error: true,
      message: 'Internal server error',
      username: '',
      phonenumber: '',
      profilepicture: '',
      dob: '',
      emailverified: 0,
      patientlocation: '',
      token: ''
    });
  }
};

// google register
exports.googleRegister = async (req, res) => {
  try {
      const { name, email, photourl, googleid, devicetoken } = req.body;

      // Validate required fields
      if (!name || !email || !googleid || !devicetoken) {
          return res.status(200).json({
              error: true,
              message: 'Name, email and Google ID are required',
              username: '',
              phonenumber: '',
              profilepicture: '',
              dob: '',
              emailverified: 0,
              patientlocation: '',
              devicetoken : '',
          });
      }

      // Create user with Google
      const userId = await User.createWithGoogle({
          name,
          email,
          photourl: photourl || '',
          googleid,
          devicetoken : devicetoken || '',
      });

      res.status(201).json({
          error: false,
          message: 'Google registration successful',
          username: name,
          phonenumber: '',
          profilepicture: photourl || '',
          dob: '',
          emailverified: 1,
          patientlocation: '',
          devicetoken : devicetoken,
      });

  } catch (error) {
      console.error('Google registration error:', error);
      res.status(200).json({
          error: true,
          message: error.message || 'Google registration failed',
          username: '',
          phonenumber: '',
          profilepicture: '',
          dob: '',
          emailverified: 0,
          patientlocation: '',
          devicetoken : '',
      });
  }
};

////google login  
exports.googleLogin = async (req, res) => {
  try {
    const { googleid, devicetoken = "", name, email, photourl } = req.body;

    // Validate required fields
    if (!googleid) {
      return res.status(200).json({
        error: true,
        message: "Google ID is required",
        username: "",
        profilepicture: "",
        phonenumber: "",
        dob: "",
        patientlocation: "",
        token: ""
      });
    }

    // First try to find by googleid
    let user = await User.findByGoogleId(googleid);

    // If not found by googleid, check if email exists with any googleid
    if (!user && email) {
      const encryptedEmail = encrypt(email);
      user = await User.findByEncryptedEmailWithGoogle(encryptedEmail);
      
      if (user) {
        return res.status(200).json({
          error: true,
          message: "Email already registered with another Google account",
          username: "",
          profilepicture: "",
          phonenumber: "",
          dob: "",
          patientlocation: "",
          token: ""
        });
      }
    }

    // If user still doesn't exist, register them
    if (!user) {
      if (!name || !email) {
        return res.status(200).json({
          error: true,
          message: "Name and email are required for first-time registration",
          username: "",
          profilepicture: "",
          dob: "",
          patientlocation: "",
          token: ""
        });
      }

      const userId = await User.createWithGoogle({
        name,
        email,
        googleid,
        photourl,
        devicetoken
      });

      user = await User.findByGoogleId(googleid);
      if (!user) throw new Error("Failed to create new Google user");
    }

    // Rest of existing code...
    if (devicetoken) {
      await User.updateDeviceTokens(user.user_id, devicetoken);
    }

    const token = generateToken(user.user_id);
    const decryptedUser = {
      username: decrypt(user.userfullname),
      phonenumber: user.mobileno ? decrypt(user.mobileno) : "",
      profilepicture: user.profilepic || DEFAULT_PROFILE_PIC,
      dob: user.dob || "",
      patientlocation: user.patientlocation || "",
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
      username: "",
      profilepicture: "" || DEFAULT_PROFILE_PIC,
      token: "",
      patientlocation: ""
    });
  }
};