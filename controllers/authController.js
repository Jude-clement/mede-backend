const User = require('../models/userModel');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateToken } = require('../utils/jwt');

const { DEFAULT_PROFILE_PIC } = require('../utils/imageHandler');

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
  emailalerts: 0,
  pushalerts: 0,
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
  emailalerts: 0,
  pushalerts: 0,
  token: ''
});
    }

        // Block login if account is soft-deleted
    if (user.onlinestatus === 0) {
      return res.status(200).json({
        error: true,
        message: 'Account deactivated. Contact support to recover.',
  username: '',
  phonenumber: '',
  profilepicture: '',
  dob: '',
  emailverified: 0,
  patientlocation: '',
  emailalerts: 0,
  pushalerts: 0,
  token: ''
      });
    }

    // Decrypt ALL stored user data for validation
    const decryptedUser = {
      email: decrypt(user.email),
      password: decrypt(user.password),
      username: decrypt(user.userfullname),
      phonenumber: decrypt(user.mobileno),

profilepicture: user.profilepic ? (() => {
  const decryptedPic = decrypt(user.profilepic);
  // Check if it's a Google URL (starts with http)
  if (decryptedPic.startsWith('http')) {
    return decryptedPic;
  }
  // Otherwise it's a local file
  return `/profile-pics/${decryptedPic}.jpg`;
})() : DEFAULT_PROFILE_PIC,

  dob: user.dob ? decrypt(user.dob) : '0000-00-00'

    };
        // Handle location decryption if exists
    let decryptedlocation = '';
    if (user.patientlocation) {
      const encryptedParts = user.patientlocation.split(',');
      const decryptedParts = encryptedParts.map(part => decrypt(part));
      decryptedlocation = decryptedParts.join(',');
    }
    
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
  emailalerts: 0,
  pushalerts: 0,
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
        emailalerts: 0,
        pushalerts: 0,
        token: ''
      });
    }
    
// Handle device token
if (devicetoken) {
  let currentTokens = [];
  if (user.devicetoken) {
    // Split the stored encrypted tokens
    const encryptedTokens = user.devicetoken.split(',');
    // Decrypt each token to check against new token
    currentTokens = encryptedTokens.map(token => decrypt(token));
  }
  
  // Only add if token doesn't exist
  if (!currentTokens.includes(devicetoken)) {
    currentTokens.push(devicetoken);
    // Encrypt each token individually then join with comma
    const updatedEncryptedTokens = currentTokens.map(token => encrypt(token)).join(',');
    await User.updateDeviceToken(user.user_id, updatedEncryptedTokens);
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
      profilepicture: decryptedUser.profilepicture,

  dob: decryptedUser.dob || '0000-00-00', // Consistent default


      emailverified: user.emailverified,
      emailalerts: user.emailalerts,
      pushalerts: user.pushalerts,
      // patientlocation: decryptedUser.patientlocation,
            patientlocation: decryptedlocation || '',

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
      emailalerts: 0,
      pushalerts: 0,
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
              emailalerts: 0,
              pushalerts: 0
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
          emailalerts: 1,
          pushalerts: 1,
          patientlocation: '',
          devicetoken : devicetoken || '',
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
          emailalerts: 0,
          pushalerts: 0,
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
        emailalerts: 0,
        pushalerts: 0,
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

        // Check deactivation status only AFTER user is found
        if (user.onlinestatus === 0) {
          return res.status(200).json({
            error: true,
            message: 'Account deactivated. Contact support.',
            username: "",
            profilepicture: "",
            phonenumber: "",
            dob: "",
            patientlocation: "",        
            emailalerts: 0,
            pushalerts: 0,
            token: ""
          });
        }

        return res.status(200).json({
          error: true,
          message: "Email already registered with another Google account",
          username: "",
          profilepicture: "",
          phonenumber: "",
          dob: "",
          patientlocation: "",          
          emailalerts: 0,
          pushalerts: 0,
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
          emailalerts: 0,
          pushalerts: 0,
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
      
      profilepicture: user.profilepic ? (() => {
  const decryptedPic = decrypt(user.profilepic);
  // Check if it's a Google URL (starts with http)
  if (decryptedPic.startsWith('http')) {
    return decryptedPic;
  }
  // Otherwise it's a local file
  return `/profile-pics/${decryptedPic}.jpg`;
})() : DEFAULT_PROFILE_PIC,
        
        // For Google login:
  dob: user.dob ? decrypt(user.dob) : '0000-00-00',

      // patientlocation: user.patientlocation ? decrypt(user.patientlocation) : "",
      emailalerts: user.emailalerts,
      pushalerts: user.pushalerts
    };
        // Handle location decryption if exists
    let decryptedlocation = '';
    if (user.patientlocation) {
      const encryptedParts = user.patientlocation.split(',');
      const decryptedParts = encryptedParts.map(part => decrypt(part));
      decryptedlocation = decryptedParts.join(',');
    }
    res.json({
      error: false,
      message: "Google authentication successful",
      // ...decryptedUser,
        username: decryptedUser.username,
  phonenumber: decryptedUser.phonenumber,
  profilepicture: decryptedUser.profilepicture, // This should now work correctly

      dob: decryptedUser.dob || '0000-00-00', // Consistent default

      patientlocation: decryptedlocation || '',

  emailalerts: decryptedUser.emailalerts,
  pushalerts: decryptedUser.pushalerts,
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
      patientlocation: "",
      emailalerts: 0,
      pushalerts: 0
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { devicetoken } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!devicetoken) {
      return res.status(200).json({
        error: true,
        message: 'Device token is required'
      });
    }

    await User.removeDeviceToken(userId, devicetoken);

    res.json({
      error: false,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Logout failed'
    });
  }
};