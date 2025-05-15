const db = require('../config/db');
const { encrypt } = require('../utils/encryption');
const DEFAULT_PROFILE_PIC = 'https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740';

class User {
  static async create(userData) {
    // First check for existing users
    const existingUser = await this.checkExistingUsers(userData.email, userData.phoneNumber);
    if (existingUser.exists) {
      throw new Error(existingUser.message);
    }

    // Encrypt all sensitive data
    const encryptedData = {
      mobileno: encrypt(userData.phoneNumber),
      email: encrypt(userData.email),
      password: encrypt(userData.password),
      userfullname: encrypt(userData.name),
      // Default values for other fields
      userstatus: 1,
      emailverified: 0,
      emailalerts: 1,
      pushalerts: 1,
      onlinestatus: 1,
      profilepic: '',
      googleid: '',
      devicetoken: '',
      patientlocation: '',
      accountotp: '',
      dob: userData.dob || '1970-01-01', // Default date if not provided
      gender: userData.gender || '',
      maritalstatus: userData.maritalstatus || ''
    };

    const [result] = await db.query(
      `INSERT INTO medusers SET ?`, 
      encryptedData
    );
    return result.insertId;
  }

  // Check for existing email or phone number
  static async checkExistingUsers(email, phoneNumber) {
    try {
      // Encrypt the values to match what's stored in DB
      const encryptedEmail = encrypt(email);
      const encryptedPhone = encrypt(phoneNumber);

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

  static async findByPhone(phoneNumber) {
    const encryptedPhone = encrypt(phoneNumber);
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
  
  static async updateDeviceToken(userId, deviceToken) {
    try {
      await db.query(
        'UPDATE medusers SET devicetoken = ? WHERE user_id = ?',
        [deviceToken, userId]
      );
    } catch (error) {
      console.error("Device token update error:", error);
      throw error;
    }
  }

// static async createWithGoogle(userData) {
//   // First check for existing users
//   const existingUser = await this.checkExistingUsers(userData.email, userData.phoneNumber);
//   if (existingUser.exists) {
//     throw new Error(existingUser.message);
//   }

//   // Encrypt all sensitive data
//   const encryptedData = {
//     mobileno: encrypt(userData.phoneNumber || ''), // Phone optional for Google signup
//     email: encrypt(userData.email),
//     password: encrypt(userData.password || crypto.randomBytes(16).toString('hex')), // Generate random password if not provided
//     userfullname: encrypt(userData.name),
//     googleid: userData.googleid,
//     // Google-specific defaults
//     emailverified: 1, // Mark as verified
//     userstatus: 1,
//     emailalerts: 1,
//     pushalerts: 1,
//     onlinestatus: 1,
//     profilepic: userData.profilePicture || DEFAULT_PROFILE_PIC, // Can add profile picture URL from Google
//       devicetoken: userData.deviceToken || '', // Add device token here
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
      mobileno: userData.phoneNumber ? encrypt(userData.phoneNumber) : '',
      email: encrypt(userData.email),
      userfullname: encrypt(userData.name),
      googleid: userData.googleid,
      profilepic: userData.photoUrl || '',
      // Mark as verified since it's from Google
      emailverified: 1,
      // Default values
      userstatus: 1,
      emailalerts: 1,
      pushalerts: 1,
      onlinestatus: 1,
      password: '', // No password for Google users
      devicetoken: userData.deviceToken || '', // Add device token here
      patientlocation: '',
      accountotp: '',
      dob: '',
      gender: '',
      maritalstatus: ''
  };

  const [result] = await db.query(
      `INSERT INTO medusers SET ?`,
      encryptedData
  );
  return result.insertId;
}

static async checkExistingGoogleUsers(email, googleId) {
  try {
      const encryptedEmail = encrypt(email);

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
          [googleId]
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

static async findByGoogleId(googleId) {
  try {
      const [rows] = await db.query(
          'SELECT * FROM medusers WHERE googleid = ?',
          [googleId]
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
          currentTokens = user[0].devicetoken.split(',');
      }

      // Add new token if not already present
      if (newToken && !currentTokens.includes(newToken)) {
          currentTokens.push(newToken);
          const updatedTokens = currentTokens.join(',');
          await db.query(
              'UPDATE medusers SET devicetoken = ? WHERE user_id = ?',
              [updatedTokens, userId]
          );
      }
  } catch (error) {
      console.error("Device token update error:", error);
      throw error;
  }
}

// Add these methods to your User class:

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