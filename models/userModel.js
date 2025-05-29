const db = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
// const DEFAULT_PROFILE_PIC = '../user-icon.jpg';
const { saveBase64Image, deleteProfilePic, DEFAULT_PROFILE_PIC } = require('../utils/imageHandler');

class User {
  static async create(userData) {
    // First check for existing users
    const existingUser = await this.checkExistingUsers(userData.email, userData.phonenumber);
    if (existingUser.exists) {
      throw new Error(existingUser.message);
    }

    // Encrypt all sensitive data
    const encryptedData = {
      mobileno: encrypt(userData.phonenumber),
      email: encrypt(userData.email),
      password: encrypt(userData.password),
      userfullname: encrypt(userData.name),
      // Default values for other fields
      userstatus: 1,
      emailverified: 0,
      emailalerts: 1,
      pushalerts: 1,
      onlinestatus: 1,
profilepic: userData.profilepic ? encrypt(userData.profilepic) : '',
googleid: userData.googleid ? encrypt(userData.googleid) : '',
devicetoken: userData.devicetoken ? encrypt(userData.devicetoken) : '',
patientlocation: userData.patientlocation ? encrypt(userData.patientlocation) : '',
accountotp: userData.accountotp ? encrypt(userData.accountotp) : '',
  dob: userData.dob ? encrypt(userData.dob) : encrypt('0000-00-00'), // Always encrypt
gender: userData.gender ? encrypt(userData.gender) : '',
maritalstatus: userData.maritalstatus ? encrypt(userData.maritalstatus) : ''
    };

    const [result] = await db.query(
      `INSERT INTO medusers SET ?`, 
      encryptedData
    );
    return result.insertId;
  }

//logout
static async removeDeviceToken(userId, deviceTokenToRemove) {
  try {
    // Get current device tokens
    const [user] = await db.query(
      'SELECT devicetoken FROM medusers WHERE user_id = ?',
      [userId]
    );
    
    if (!user[0] || !user[0].devicetoken) return false;
    
    // Decrypt and split tokens
    const currentTokens = user[0].devicetoken.split(',')
      .map(token => decrypt(token))
      .filter(token => token !== deviceTokenToRemove);
    
    // Encrypt remaining tokens
    const updatedTokens = currentTokens
      .map(token => encrypt(token))
      .join(',');
    
    // Update database
    await db.query(
      'UPDATE medusers SET devicetoken = ? WHERE user_id = ?',
      [updatedTokens || '', userId]
    );
    
    return true;
  } catch (error) {
    console.error('Error removing device token:', error);
    throw error;
  }
}

  // Check for existing email or phone number
  static async checkExistingUsers(email, phonenumber) {
    try {
      // Encrypt the values to match what's stored in DB
      const encryptedEmail = encrypt(email);
      const encryptedPhone = encrypt(phonenumber);

      const [emailRows] = await db.query(
        'SELECT user_id FROM medusers WHERE email = ? AND onlinestatus = 1',
        [encryptedEmail]
      );

      if (emailRows.length > 0) {
        return { exists: true, message: 'Email already registered' };
      }

      const [phoneRows] = await db.query(
        'SELECT user_id FROM medusers WHERE mobileno = ? AND onlinestatus = 1',
        [encryptedPhone]
      );

      if (phoneRows.length > 0) {
        return { exists: true, message: 'Phone number already registered' };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking existing users:', error);
      throw error;
    }
  }

  // Other existing methods...
  static async findByEmail(email) {
    const encryptedEmail = encrypt(email);
    const [rows] = await db.query(
      'SELECT * FROM medusers WHERE email = ? AND onlinestatus = 1',
      [encryptedEmail]
    );
    return rows[0];
  }

  static async findByPhone(phonenumber) {
    const encryptedPhone = encrypt(phonenumber);
    const [rows] = await db.query(
      'SELECT * FROM medusers WHERE mobileno = ? AND onlinestatus = 1',
      [encryptedPhone]
    );
    return rows[0];
  }

  static async findByEncryptedEmail(encryptedEmail) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM medusers WHERE email = ?', 
        [encryptedEmail]
      );
      return rows[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
  
  static async updateDeviceToken(userId, devicetoken) {
    try {
    // const encryptedtoken = devicetoken ? encrypt(devicetoken) : '';

      await db.query(
        'UPDATE medusers SET devicetoken = ? WHERE user_id = ?',
        [ devicetoken, userId]
      );
    } catch (error) {
      console.error("Device token update error:", error);
      throw error;
    }
  }

///google signup

static async createWithGoogle(userData) {
  // Check for existing users (email or googleId)
  const existingUser = await this.checkExistingGoogleUsers(userData.email, userData.googleid);
  if (existingUser.exists) {
      throw new Error(existingUser.message);
  }

  // Encrypt sensitive data
  const encryptedData = {
      mobileno: userData.phonenumber ? encrypt(userData.phonenumber) : '',
      email: encrypt(userData.email),
      userfullname: encrypt(userData.name),

      // Mark as verified since it's from Google
      emailverified: 1,
      // Default values
      userstatus: 1,
      emailalerts: 1,
      pushalerts: 1,
      onlinestatus: 1,
      password: '', // No password for Google users
      googleid: userData.googleid ? encrypt(userData.googleid) : '',
      profilepic: userData.photourl ? encrypt(userData.photourl) : '',
devicetoken: userData.devicetoken ? encrypt(userData.devicetoken) : '',
patientlocation: userData.patientlocation ? encrypt(userData.patientlocation) : '',
accountotp: userData.accountotp ? encrypt(userData.accountotp) : '',
  dob: userData.dob ? encrypt(userData.dob) : encrypt('0000-00-00'), // Always encrypt
gender: userData.gender ? encrypt(userData.gender) : '',
maritalstatus: userData.maritalstatus ? encrypt(userData.maritalstatus) : ''

  };

  const [result] = await db.query(
      `INSERT INTO medusers SET ?`,
      encryptedData
  );
  return result.insertId;
}

static async checkExistingGoogleUsers(email, googleid) {
  try {
      const encryptedEmail = encrypt(email);
      const encryptedgoogleid = encrypt(googleid);

      // Check if email exists (normal registration)
      const [emailRows] = await db.query(
          'SELECT user_id FROM medusers WHERE email = ? AND googleid = ""',
          [encryptedEmail]
      );

      if (emailRows.length > 0) {
          return { exists: true, message: 'Email already registered with normal account' };
      }

      // Check if Google account exists
      const [googleRows] = await db.query(
          'SELECT user_id FROM medusers WHERE googleid = ?',
          [encryptedgoogleid]
      );

      if (googleRows.length > 0) {
          return { exists: true, message: 'Google account already registered' };
      }

      return { exists: false };
  } catch (error) {
      console.error('Error checking existing Google users:', error);
      throw error;
  }
}

//google signin

static async findByEncryptedEmailWithGoogle(encryptedEmail) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM medusers WHERE email = ? AND googleid != ""',
      [encryptedEmail]
    );
    return rows[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

static async findByGoogleId(googleid) {
  try {
    const encryptedgoogleid = encrypt(googleid);
      const [rows] = await db.query(
          'SELECT * FROM medusers WHERE googleid = ?',
          [encryptedgoogleid]
      );
      return rows[0];
  } catch (error) {
      console.error("Database error:", error);
      throw error;
  }
}

static async updateDeviceTokens(userId, newToken) {
  try {
    
      // Get current tokens
      const [user] = await db.query(
          'SELECT devicetoken FROM medusers WHERE user_id = ?',
          [userId]
      );
      
      let currentTokens = [];
    if (user[0].devicetoken) {
        currentTokens = user[0].devicetoken.split(','); // These are encrypted
        // Decrypt each token to check against new token
        currentTokens = currentTokens.map(token => decrypt(token));
    }

      // Add new token if not already present
    if (newToken && !currentTokens.includes(newToken)) {
        currentTokens.push(newToken);
        // Encrypt each token individually then join
        const encryptedTokens = currentTokens.map(token => encrypt(token)).join(',');
        await db.query(
            'UPDATE medusers SET devicetoken = ? WHERE user_id = ?',
            [encryptedTokens, userId]
        );
    }
  } catch (error) {
      console.error("Device token update error:", error);
      throw error;
  }
}

// Add these methods to User class

static async setVerificationToken(userId, token, expiresAt) {
  await db.query(
    'UPDATE medusers SET verification_token = ?, verification_expires = ? WHERE user_id = ?',
    [token, expiresAt, userId]
  );
}

static async verifyUser(token) {
  const [user] = await db.query(
    'SELECT user_id FROM medusers WHERE verification_token = ? AND verification_expires > NOW()',
    [token]
  );
  
  if (!user[0]) return false;

  await db.query(
    'UPDATE medusers SET emailverified = 1, verification_token = NULL, verification_expires = NULL WHERE user_id = ?',
    [user[0].user_id]
  );
  
  return true;
}


static async markEmailAsVerified(userId) {
  await db.query(
    'UPDATE medusers SET emailverified = 1 WHERE user_id = ?',
    [userId]
  );
}

static async findUserByEmailForVerification(email) {
  const encryptedEmail = encrypt(email);
  const [rows] = await db.query(
    'SELECT user_id, emailverified FROM medusers WHERE email = ?',
    [encryptedEmail]
  );
  return rows[0];
}

static async updatePassword(userId, newPassword) {
  const encryptedPassword = encrypt(newPassword);
  await db.query(
    'UPDATE medusers SET password = ? WHERE user_id = ?',
    [encryptedPassword, userId]
  );
}

// update location
static async updatePatientLocation(userId, patientlocation) {
  try {
        const locationparts = patientlocation ? patientlocation.split(',') : [];
    // Encrypt each part individually
    const encryptedparts = locationparts.map(part => encrypt(part.trim()));
    const encryptedpatientlocation = encryptedparts.join(',');
    await db.query(
      'UPDATE medusers SET patientlocation = ? WHERE user_id = ?',
      [encryptedpatientlocation, userId]
    );
    return true;
  } catch (error) {
    console.error("Location update error:", error);
    throw error;
  }
}

//for googleid checking in update profile
static async findById(userId) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM medusers WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// get profile
static async getProfile(userId) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM medusers WHERE user_id = ?',
      [userId]
    );
    
    if (!rows[0]) {
      throw new Error('User not found');
    }

    const user = rows[0];

        // Handle location decryption if exists
    let decryptedlocation = '';
    if (user.patientlocation) {
      const encryptedParts = user.patientlocation.split(',');
      const decryptedParts = encryptedParts.map(part => decrypt(part));
      decryptedlocation = decryptedParts.join(',');
    }

        // FIXED DOB HANDLING - SIMPLE AND CONSISTENT
    let dobValue = '0000-00-00'; // Default value
    if (user.dob) {
      try {
        const decryptedDob = decrypt(user.dob);
        dobValue = decryptedDob || '0000-00-00';
      } catch (error) {
        console.error('DOB decryption error:', error);
        dobValue = '0000-00-00';
      }
    }
    return {
      username: user.userfullname ? decrypt(user.userfullname) : '',
      phonenumber: user.mobileno ? decrypt(user.mobileno) : '',
      email: user.email ? decrypt(user.email) : '',
      gender: decrypt(user.gender) || '',

// Replace the dob line with:
      dob: dobValue, // FIXED - Always returns valid date

      maritalstatus: decrypt(user.maritalstatus) || '',
  
    profilepicture: user.profilepic ? (() => {
  const decryptedPic = decrypt(user.profilepic);
  // Check if it's a Google URL (starts with http)
  if (decryptedPic.startsWith('http')) {
    return decryptedPic;
  }
  // Otherwise it's a local file
  return `/profile-pics/${decryptedPic}.jpg`;
})() : DEFAULT_PROFILE_PIC,  
      
      emailverified: user.emailverified,
      patientlocation: decryptedlocation || '',
      emailalerts: user.emailalerts,
      pushalerts: user.pushalerts
    };
  } catch (error) {
    // console.error('Profile fetch error:', error);
    throw error;
  }
}

// update profile
static async updateProfile(userId, updateData) {
  let newImageInfo = null;
  
  // Handle profile picture update if it's a base64 string (new image)
  if (updateData.profilepicture && updateData.profilepicture.includes('base64')) {
    try {
      // Get current profile to check for existing picture
      const current = await this.getProfile(userId);
      
      // Save new image
      newImageInfo = await saveBase64Image(userId, updateData.profilepicture);
      
      // Use the encrypted filename from saveBase64Image
      updateData.profilepic = newImageInfo.encryptedFilename;
      
      // Delete old image if it exists and isn't default
      if (current.profilepicture && 
          !current.profilepicture.includes(DEFAULT_PROFILE_PIC)) {
        // Get the encrypted filename from DB
        const [user] = await db.query(
          'SELECT profilepic FROM medusers WHERE user_id = ?',
          [userId]
        );
        if (user[0]?.profilepic) {
          await deleteProfilePic(user[0].profilepic);
        }
      }
    } catch (error) {
      // Clean up new image if something failed
      if (newImageInfo) {
        await deleteProfilePic(newImageInfo.encryptedFilename);
      }
      throw error;
    }
  }

  // Remove the profilepicture field to avoid DB errors
  delete updateData.profilepicture;

  try {
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredData).length === 0) return;

    await db.query(
      'UPDATE medusers SET ? WHERE user_id = ?',
      [filteredData, userId]
    );
  } catch (error) {
    // Clean up new image if DB update fails
    if (newImageInfo) {
      await deleteProfilePic(newImageInfo.encryptedFilename);
    }
    console.error('Profile update error:', error);
    throw error;
  }
}

// change password
static async changePassword(userId, oldPassword, newPassword) {
  try {
    // Get current password
    const [rows] = await db.query(
      'SELECT password FROM medusers WHERE user_id = ?',
      [userId]
    );
    
    if (!rows[0]) throw new Error('User not found');
    
    // Verify old password
    const currentEncryptedPassword = rows[0].password;
    const decryptedOldPassword = decrypt(currentEncryptedPassword);
    
    if (decryptedOldPassword !== oldPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Encrypt and update new password
    const encryptedNewPassword = encrypt(newPassword);
    await db.query(
      'UPDATE medusers SET password = ? WHERE user_id = ?',
      [encryptedNewPassword, userId]
    );
    
    return true;
  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
}
}


module.exports = User;