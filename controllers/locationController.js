const User = require('../models/userModel');

exports.updateLocation = async (req, res) => {
  try {
    const { patientlocation } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!patientlocation) {
      return res.status(200).json({
        error: true,
        message: 'Location data is required'
      });
    }

    await User.updatePatientLocation(userId, patientlocation);

    res.status(200).json({
      error: false,
      message: 'Location updated successfully'
    });

  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message || 'Failed to update location'
    });
  }
};