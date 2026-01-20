const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

// Admin only
router.get('/', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
  
  try {
    const result = await pool.query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;