const pool = require('../config/database').pool;

const logActivity = async (userId, action, details, req) => {
  try {
    // Extract IP address from request if available
    let ip = 'system';
    if (req) {
      ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, action, details, ip]
    );
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};

module.exports = { logActivity };