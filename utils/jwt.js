const jwt = require('jsonwebtoken');
const { encrypt } = require('./encryption');
const { decrypt } = require('./encryption');
require('dotenv').config();

const generateToken = (userId) => {
  // First create the JWT
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  // Then encrypt it with crypto
  return encrypt(token);
};

const verifyToken = (encryptedToken) => {
  try {
    // First decrypt the token
    const token = decrypt(encryptedToken);
    // Then verify the JWT
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = { generateToken, verifyToken };