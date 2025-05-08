const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'e0e36cdd047e0c636e52a910eb83e11ff92b7f216a806ba62d6fb4707823ced5', {
    expiresIn: '30d' // Token expires in 30 days
  });
};

module.exports = { generateToken };