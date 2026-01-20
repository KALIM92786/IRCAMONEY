const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Aggregate stats
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(profit) as total_profit
      FROM deals d
      JOIN accounts a ON d.account_id = a.id
      WHERE a.user_id = $1
    `, [req.user.id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;