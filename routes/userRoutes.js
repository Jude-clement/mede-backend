const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const verificationController = require('../controllers/verificationController');
const passwordController = require('../controllers/passwordController');
const locationController = require('../controllers/locationController');
const authenticate = require('../middlewares/authMiddleware');
const advertisementController = require('../controllers/advertisementController');
const profileController = require('../controllers/profileController');
const notificationController = require('../controllers/notificationController');

// User registration route
// router.post('/signup', userController.signup);
router.post('/auth/login', authController.login);

// Google registration route
router.post('/auth/googleregister', authController.googleRegister);
// Google login route 
router.post('/auth/googlelogin', authController.googleLogin);


router.post('/auth/signup', userController.signup);
router.get('/auth/verify-email', verificationController.verifyEmail);  // to verify email
router.post('/auth/sendverificationemail', verificationController.sendVerification); //to send verification email
// router.post('/resendverificationemail', verificationController.resendVerificationEmail); //to send verification email

//update location
router.post('/location/update-location', authenticate ,locationController.updateLocation);
//advertisement
router.post('/ad/dashboard', authenticate, advertisementController.getAdvertisement);

//profile
router.post('/user/profile', authenticate, profileController.getProfile);
//edit profile
router.post('/user/editprofile', authenticate, profileController.editProfile);
// reset password 
router.post('/pass/reset-password', passwordController.requestReset); // Initiate reset
router.post('/pass/reset-password/confirm', passwordController.resetPassword); // Finalize reset

router.post('/pass/changepassword', authenticate, passwordController.changePassword);

//notification
router.post('/notify/setemailnote', authenticate, notificationController.setEmailNotification);
router.post('/notify/setpushnote', authenticate, notificationController.setPushNotification);

//for showing message
router.get('/pass/reset-password/confirm', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(200).send('Invalid reset link');
  }
  
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Reset Password</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    input { width: 100%; padding: 10px; margin: 8px 0; box-sizing: border-box; }
    button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
    button:hover { background-color: #45a049; }
    .success-message { color: #4CAF50; font-weight: bold; margin-top: 20px; display: none; }
  </style>
</head>
<body>
  <h1>Reset Your Password</h1>
  <p>You are only one step away from your new password</p>
  <form id="resetForm">
    <input type="hidden" name="token" value="${token}">
    <label for="newPassword">Password</label>
    <input type="password" id="newPassword" name="newPassword" required>
    
    <label for="confirmPassword">Confirm Password</label>
    <input type="password" id="confirmPassword" name="confirmPassword" required>
    
    <button type="submit">Change Password</button>
  </form>
  
  <div id="successMessage" class="success-message">
    Password changed successfully! You can close this page now.
  </div>
  
  <script>
    document.getElementById('resetForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      if (data.newPassword !== data.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        const response = await fetch('/api/pass/reset-password/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.error) {
          alert(result.message);
        } else {
          // Hide the form and show success message
          document.getElementById('resetForm').style.display = 'none';
          document.getElementById('successMessage').style.display = 'block';
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  </script>
</body>
</html>
  `);
});

module.exports = router;


// // in server.js
// app.post('/update-location', 
//   multer().none(), // Process form-data first
//   authMiddleware,  // Then verify token
//   locationController.updateLocation
// );
