const db = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
// const DEFAULT_PROFILE_PIC = '../user-icon.jpg';

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
  dob: userData.dob ? encrypt(userData.dob) : encrypt('0000-00-00'), // Encrypt default value too
gender: userData.gender ? encrypt(userData.gender) : '',
maritalstatus: userData.maritalstatus ? encrypt(userData.maritalstatus) : ''
    };

    const [result] = await db.query(
      `INSERT INTO medusers SET ?`, 
      encryptedData
    );
    return result.insertId;
  }

  // Check for existing email or phone number
  static async checkExistingUsers(email, phonenumber) {
    try {
      // Encrypt the values to match what's stored in DB
      const encryptedEmail = encrypt(email);
      const encryptedPhone = encrypt(phonenumber);

      const [emailRows] = await db.query(
        'SELECT user_id FROM medusers WHERE email = ?',
        [encryptedEmail]
      );

      if (emailRows.length > 0) {
        return { exists: true, message: 'Email already registered' };
      }

      const [phoneRows] = await db.query(
        'SELECT user_id FROM medusers WHERE mobileno = ?',
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
      'SELECT * FROM medusers WHERE email = ?',
      [encryptedEmail]
    );
    return rows[0];
  }

  static async findByPhone(phonenumber) {
    const encryptedPhone = encrypt(phonenumber);
    const [rows] = await db.query(
      'SELECT * FROM medusers WHERE mobileno = ?',
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

//first createwith google

// static async createWithGoogle(userData) {
//   // First check for existing users
//   const existingUser = await this.checkExistingUsers(userData.email, userData.phonenumber);
//   if (existingUser.exists) {
//     throw new Error(existingUser.message);
//   }

//   // Encrypt all sensitive data
//   const encryptedData = {
//     mobileno: encrypt(userData.phonenumber || ''), // Phone optional for Google signup
//     email: encrypt(userData.email),
//     // password: encrypt(userData.password || crypto.randomBytes(16).toString('hex')), // Generate random password if not provided
//     userfullname: encrypt(userData.name),
//     googleid: userData.googleid,
//     profilepic: userData.photourl || '',
//     // Google-specific defaults
//     emailverified: 1, // Mark as verified
//     userstatus: 1,
//     emailalerts: 1,
//     pushalerts: 1,
//     onlinestatus: 1,
//     password: '', // No password for Google users
//     profilepic: userData.profilepicture || '', // Can add profile picture URL from Google
//     devicetoken: userData.devicetoken || '', // Add device token here
//     patientlocation: '',
//     accountotp: '',
//     dob: userData.dob || '1970-01-01',
//     gender: userData.gender || '',
//     maritalstatus: userData.maritalstatus || ''
//   };

//   const [result] = await db.query(
//     `INSERT INTO medusers SET ?`, 
//     encryptedData
//   );
//   return result.insertId;
// }


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
profilepic: userData.profilepicture ? encrypt(userData.profilepicture) : '',
devicetoken: userData.devicetoken ? encrypt(userData.devicetoken) : '',
patientlocation: userData.patientlocation ? encrypt(userData.patientlocation) : '',
accountotp: userData.accountotp ? encrypt(userData.accountotp) : '',
  dob: userData.dob ? encrypt(userData.dob) : encrypt('0000-00-00'),
gender: userData.gender ? encrypt(userData.gender) : '',
maritalstatus: userData.maritalstatus ? encrypt(userData.maritalstatus) : ''
      // patientlocation: '',
      // accountotp: '',
      // dob: '',
      // gender: '',
      // maritalstatus: ''
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

    return {
      username: user.userfullname ? decrypt(user.userfullname) : '',
      phonenumber: user.mobileno ? decrypt(user.mobileno) : '',
      email: user.email ? decrypt(user.email) : '',
      gender: decrypt(user.gender) || '',
      // dob: decrypt(user.dob) || '',
// dob: user.dob ? decrypt(user.dob) || '0000-00-00' : '0000-00-00',
dob: user.dob && user.dob !== encrypt('0000-00-00') 
     ? decrypt(user.dob) 
     : '0000-00-00',

      maritalstatus: decrypt(user.maritalstatus) || '',
      profilepicture: decrypt(user.profilepic) || DEFAULT_PROFILE_PIC,
      emailverified: user.emailverified,
      patientlocation: decryptedlocation || ''
    };
  } catch (error) {
    // console.error('Profile fetch error:', error);
    throw error;
  }
}

static async updateProfile(userId, updateData) {
  try {
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredData).length === 0) {
      return; // Nothing to update
    }

    await db.query(
      'UPDATE medusers SET ? WHERE user_id = ?',
      [filteredData, userId]
    );
  } catch (error) {
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



// for cleaner duplicate checking:
// static async findOrCreateByGoogle(googleUserData) {
//   try {
//     // Try to find existing user
//     let user = await this.findByGoogleId(googleUserData.googleid);
    
//     if (!user) {
//       // Create if not exists
//       const userId = await this.createWithGoogle(googleUserData);
//       user = await this.findByGoogleId(googleUserData.googleid);
//     }
    
//     return user;
//   } catch (error) {
//     throw error;
//   }
// }