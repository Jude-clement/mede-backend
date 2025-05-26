const Notification = require("../models/notificationModel");

exports.setEmailNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(200).json({
        error: true,
        emailalerts: 0,
        message: "User ID is required"
      });
    }

    const newStatus = await Notification.toggleEmailAlerts(userId);

    res.status(200).json({
      error: false,
      emailalerts: newStatus,
      message: `Email notifications ${newStatus === 1 ? "enabled" : "disabled"}`
    });

  } catch (error) {
    console.error('Email notification error:', error);
    res.status(200).json({
      error: true,
      emailalerts: 0,
      message: error.message || "Failed to update email notification settings"
    });
  }
};

exports.setPushNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(200).json({
        error: true,
        pushalerts: 0,
        message: "User ID is required"
      });
    }

    const newStatus = await Notification.togglePushAlerts(userId);

    res.status(200).json({
      error: false,
      pushalerts: newStatus,
      message: `Push notifications ${newStatus === 1 ? "enabled" : "disabled"}`
    });

  } catch (error) {
    console.error('Push notification error:', error);
    res.status(200).json({
      error: true,
      pushalerts: 0,
      message: error.message || "Failed to update push notification settings"
    });
  }
}; 