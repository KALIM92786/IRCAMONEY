const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trading_goals WHERE user_id = $1 ORDER BY year DESC, month DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { month, year, target_amount } = req.body;
  try {
    await pool.query(`
      INSERT INTO trading_goals (user_id, month, year, target_amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, month, year)
      DO UPDATE SET target_amount = EXCLUDED.target_amount, updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, month, year, target_amount]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;