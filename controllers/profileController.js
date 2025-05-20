const User = require('../models/userModel');
const { decrypt, encrypt } = require('../utils/encryption');
DEFAULT_PROFILE_PIC='/user-icon.avif';
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');

//get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const profile = await User.getProfile(userId);
    
    res.status(200).json({
      error: false,
      message: 'Profile retrieved successfully',
      ...profile
    });

  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message || 'Failed to fetch profile',
      username: '',
      phonenumber: '',
      email: '',
      gender: '',
      dob: '',
      maritalstatus: '',
      profilepicture: '',
      emailverified: 0
    });
  }
};

//edit profile
exports.editProfile = async (req, res) => {

  try {
    // const userId = req.user.id;BASE_URL
      const userId = req.user.id; // From auth middleware
      const allowedFields = ['username', 'phonenumber', 'email', 'gender','dob','maritalstatus','profilepicture'  ];

    // Check for unknown fields
    const receivedFields = Object.keys(req.body);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(200).json({
        error: true,
        message: `Invalid field(s): ${invalidFields.join(', ')}`
      });
    }

    const {
      username,
      phonenumber,
      email,
      gender,
      dob,
      maritalstatus,
      profilepicture
    } = req.body;

//         // Validate input
// if (!username || !phonenumber || !email || !gender || !dob || !maritalstatus || !profilepicture) {
//   return res.status(200).json({
//     error: true,
//     message: 'All fields are required'
//   });
// }

    // First check if user is Google-authenticated using the new findById method
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Check if user has a googleId (it will be encrypted in the database)
    const hasGoogleId = user.googleid && user.googleid !== '';
    
    // If Google-authenticated user is trying to change email
    if (hasGoogleId && email && email !== decrypt(user.email)) {
      return res.status(200).json({
        error: true,
        message: 'Google-authenticated users cannot change their email'
      });
    }

    // Get current profile to compare changes
    const currentProfile = await User.getProfile(userId);

    // Prepare update data
    const updateData = {
      userfullname: username ? encrypt(username) : undefined,
      mobileno: phonenumber ? encrypt(phonenumber) : undefined,
      gender: gender ? encrypt(gender) : undefined,
      dob: dob ? encrypt(dob) : undefined,
      maritalstatus: maritalstatus ? encrypt(maritalstatus) : undefined,
      profilepic: profilepicture ? encrypt(profilepicture) : 
                 (currentProfile.profilepicture ? undefined : encrypt(DEFAULT_PROFILE_PIC))
    };

    // Check if email is being changed
    let shouldSendVerification = false;
    if (email && email !== currentProfile.email) {
      // Check if new email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.user_id !== userId) {
        return res.status(200).json({
          error: true,
          message: 'Email already registered by another user'
        });
      }
      
      updateData.email = encrypt(email);
      updateData.emailverified = 0; // Reset verification status
      shouldSendVerification = true;
    }

    // Update the profile
    await User.updateProfile(userId, updateData);

    // Send verification email if email was changed
    if (shouldSendVerification) {
      const verificationToken = encrypt(email);
      const verificationUrl = `/api/verify-email?token=${encodeURIComponent(verificationToken)}`;
      await sendVerificationEmail(email, verificationUrl);
    }

    res.status(200).json({
      error: false,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message || 'Failed to update profile'
    });
  }
};