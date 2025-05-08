const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const verificationController = require('../controllers/verificationController');

// User registration route
router.post('/signup', userController.signup);
router.post('/login', authController.login);

// Google registration route
router.post('/googleregister', authController.googleRegister);
// Google login route 
router.post('/googlelogin', authController.googleLogin);

// Send verification email
router.post('/send-verification', verificationController.sendVerification);
// Verify email (clicked from email)
router.get('/verify-email', verificationController.verifyEmail);

module.exports = router;