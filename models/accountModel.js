const db = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');

class Account {

  // Generate and save OTP (encrypted)
  static async generateAccountDeletionOTP(userId) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
    await db.query(
      'UPDATE medusers SET accountotp = ?, otptime = ? WHERE user_id = ?',
      [encrypt(otp), otpExpiry, userId]
    );
    return otp;
  }

  // Verify OTP and deactivate account
  static async verifyAndDeleteAccount(userId, userOtp) {
    const [user] = await db.query(
      'SELECT accountotp, otptime FROM medusers WHERE user_id = ?',
      [userId]
    );
    
    // Check if OTP exists and matches
    if (!user[0]?.accountotp || decrypt(user[0].accountotp) !== userOtp)
    // if (!user[0]?.accountotp || decrypt(user[0].accountotp) !== userOtp.trim())    
        {
      throw new Error('Invalid OTP');
    }
    
    // Check expiry
    if (new Date(user[0].otptime) < new Date()) {
      throw new Error('OTP expired');
    }

    // Soft delete (set onlinestatus = 0)
    await db.query(
      'UPDATE medusers SET onlinestatus = 0 WHERE user_id = ?',
      [userId]
    );
  }

  // Reactivate account
  // static async reactivateAccount(userId) {
  // await db.query(
  //   'UPDATE medusers SET onlinestatus = 1 WHERE user_id = ?',
  //   [userId]
  // );
  // }

}

module.exports = Account;