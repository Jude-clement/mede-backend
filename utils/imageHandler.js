// utils/imageHandler.js
const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('./encryption');
const crypto = require('crypto');

const PROFILE_PIC_DIR = path.join(__dirname, '../public/profile-pics');
const DEFAULT_PROFILE_PIC = '/profile-pics/user-icon.jpg';

// Ensure directory exists
if (!fs.existsSync(PROFILE_PIC_DIR)) {
  fs.mkdirSync(PROFILE_PIC_DIR, { recursive: true });
}

function generateUniqueFilename(userId) {
  return `${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

async function saveBase64Image(userId, base64String) {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filename = generateUniqueFilename(userId);
    const filePath = path.join(PROFILE_PIC_DIR, `${filename}.jpg`);
    
    await fs.promises.writeFile(filePath, buffer);
    
    return {
      encryptedFilename: encrypt(filename),
      publicUrl: `/profile-pics/${filename}.jpg`
    };
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

async function deleteProfilePic(filename) {
  if (!filename || filename.includes('default')) return;
  
  try {
    const decrypted = decrypt(filename);
    const filePath = path.join(PROFILE_PIC_DIR, `${decrypted}.jpg`);
    await fs.promises.unlink(filePath);
    
  } catch (error) {
    console.error('Error deleting profile picture:', error);
  }
}

module.exports = {
  saveBase64Image,
  deleteProfilePic,
  // getProfilePictureUrl,
  DEFAULT_PROFILE_PIC
};


// Alternative cleaner approach - Add this helper function to utils/imageHandler.js:
// function getProfilePictureUrl(encryptedProfilePic) {
//   if (!encryptedProfilePic) return DEFAULT_PROFILE_PIC;
  
//   const decryptedPic = decrypt(encryptedProfilePic);
  
//   // Check if it's a Google URL (starts with http)
//   if (decryptedPic.startsWith('http')) {
//     return decryptedPic;
//   }
  
//   // Otherwise it's a local file
//   return `/profile-pics/${decryptedPic}.jpg`;
// }

// // Then in all three locations, simply use:
// profilepicture: getProfilePictureUrl(user.profilepic),