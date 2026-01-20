const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

// Get all broker connections
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, broker_name, account_id, is_active, created_at FROM broker_connections WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a connection
router.post('/', authenticateToken, async (req, res) => {
  const { broker_name, account_id, api_token } = req.body;
  try {
    await pool.query(`
      INSERT INTO broker_connections (user_id, broker_name, account_id, api_token) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, account_id) 
      DO UPDATE SET 
        api_token = EXCLUDED.api_token,
        broker_name = EXCLUDED.broker_name
    `, [req.user.id, broker_name || 'RoboForex', account_id, api_token]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;