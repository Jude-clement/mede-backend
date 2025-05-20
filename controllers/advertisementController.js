const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../utils/jwt');

// Directory where ads are stored
const ADS_DIR = path.join(__dirname, '../public/ads');
const BASE_URL = process.env.BASE_URL || '';

exports.getAdvertisement = async (req, res) => {
  try {
    // Verify token (optional if you want this to be public)
    if (req.headers.token) {
      const decoded = verifyToken(req.headers.token);
      req.user = { id: decoded.id };
    }

    // Read all ad files from directory
    const adFiles = fs.readdirSync(ADS_DIR).filter(file => {
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase());
    });

    if (adFiles.length === 0) {
      return res.status(200).json({
        error: true,
        imagepath: "",
        message: "No advertisements available"
      });
    }

    // Select random ad
    const randomAd = adFiles[Math.floor(Math.random() * adFiles.length)];
    // const imagepath = `${BASE_URL}/ads/${randomAd}`;
    const imagepath = `/ads/${randomAd}`;

    res.status(200).json({
      error: false,
      imagepath: imagepath,
      message: "Advertisement fetched successfully"
    });

  } catch (error) {
    res.status(200).json({
      error: true,
      imagepath: "",
      message: error.message || "Failed to fetch advertisement"
    });
  }
};