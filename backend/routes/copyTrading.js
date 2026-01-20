const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

// Get all copy trading rules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM copy_trading_rules WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new rule
router.post('/', authenticateToken, async (req, res) => {
  const { master_account_id, slave_account_id, multiplier } = req.body;
  try {
    await pool.query(
      'INSERT INTO copy_trading_rules (user_id, master_account_id, slave_account_id, multiplier) VALUES ($1, $2, $3, $4)',
      [req.user.id, master_account_id, slave_account_id, multiplier]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a rule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM copy_trading_rules WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;