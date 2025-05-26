require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');

// Enhanced middleware configuration
app.use(cors());
// Serve static files
app.use('/ads', express.static(path.join(__dirname, 'public/ads')));
//
app.use('/profile-pics', express.static(path.join(__dirname, 'public/profile-pics')));

// Custom body parser that handles both JSON and form-data
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Handle form-data with proper error handling
    multer().none()(req, res, (err) => {
      if (err) {
        console.error('Form-data parsing error:', err);
        return res.status(200).json({ 
          error: true, 
          message: 'Invalid form-data format' 
        });
      }
      
      // Trim all string values
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      }
      next();
    });
  } else {
    // Standard JSON/URL-encoded handling
    bodyParser.json()(req, res, (err) => {
      if (err) {
        console.error('JSON parsing error:', err);
        return res.status(200).json({ 
          error: true, 
          message: 'Invalid JSON format' 
        });
      }
      bodyParser.urlencoded({ extended: true })(req, res, next);
    });
  }
});

// Database connection
const db = require('./config/db');

// Routes
app.use('/api', require('./routes/userRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: true, 
    message: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));