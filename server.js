require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = require('./config/db');

// Routes
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/userRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));