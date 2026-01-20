const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    const referrals = await pool.query('SELECT username, created_at FROM users WHERE referred_by = $1', [req.user.id]);
    
    res.json({
      code: user.rows[0].referral_code,
      referrals: referrals.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;