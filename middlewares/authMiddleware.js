const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({
        error: true,
        message: 'Authorization token missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    req.user = { id: decoded.id }; // Attach user ID to request
    next();

  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message || 'Invalid token'
    });
  }
};

module.exports = authenticate;