const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-cbc';
// Use fixed IV for consistent encryption 
const iv = Buffer.from('0022331144556677', 'utf8'); 
// Ensure 32-byte key (pad if needed)
const key = crypto.createHash('sha256')
                .update(String(process.env.ENCRYPTION_KEY || ''))
                .digest('base64')
                .substr(0, 32);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted; // Returns just the encrypted string
}

function decrypt(encryptedText) {
  // if (!encryptedText) return ''; // Return empty string for null/undefined
  
  // Skip decryption if it doesn't look like hex
  // if (!/^[0-9a-fA-F]+$/.test(encryptedText)) {
  //   return encryptedText;
  // }

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return ''; // Return empty string on decryption failure
  }
}

module.exports = { encrypt, decrypt };