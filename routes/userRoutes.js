const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const verificationController = require('../controllers/verificationController');
const passwordController = require('../controllers/passwordController');

// User registration route
// router.post('/signup', userController.signup);
router.post('/login', authController.login);

// Google registration route
router.post('/googleregister', authController.googleRegister);
// Google login route 
router.post('/googlelogin', authController.googleLogin);


router.post('/signup', userController.signup);
router.get('/verify-email', verificationController.verifyEmail);  // ?token=xyz
router.post('/sendverificationemail', verificationController.resendVerificationEmail);

router.post('/reset-password', passwordController.requestReset); // Initiate reset
router.post('/reset-password/confirm', passwordController.resetPassword); // Finalize reset

//for showing message
router.get('/reset-password/confirm', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Invalid reset link');
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
            const response = await fetch('/api/reset-password/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (result.error) {
              alert(result.message);
            } else {
              alert('Password changed successfully!');
              window.location.href = '/login'; // Redirect to login
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
