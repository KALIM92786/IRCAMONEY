const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    // Simple leaderboard based on total profit from deals
    const result = await pool.query(`
      SELECT a.id as account_id, a.name, SUM(d.profit) as total_profit
      FROM accounts a
      JOIN deals d ON a.id = d.account_id
      GROUP BY a.id, a.name
      ORDER BY total_profit DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;