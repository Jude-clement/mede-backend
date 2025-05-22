const db = require('../config/db');

class Notification {
  static async getUserNotificationSettings(userId) {
    try {
      const [rows] = await db.query(
        'SELECT emailalerts, pushalerts FROM medusers WHERE user_id = ? LIMIT 1',
        [userId]
      );
      return rows[0] || null; // Return null if no user found
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  static async toggleEmailAlerts(userId) {
    const user = await this.getUserNotificationSettings(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const newStatus = user.emailalerts === 1 ? 0 : 1;
    await db.query(
      'UPDATE medusers SET emailalerts = ? WHERE user_id = ?',
      [newStatus, userId]
    );
    return newStatus;
  }

  static async togglePushAlerts(userId) {
    const user = await this.getUserNotificationSettings(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const newStatus = user.pushalerts === 1 ? 0 : 1;
    await db.query(
      'UPDATE medusers SET pushalerts = ? WHERE user_id = ?',
      [newStatus, userId]
    );
    return newStatus;
  }
}

module.exports = Notification;