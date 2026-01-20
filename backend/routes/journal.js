const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

// Get note for a specific deal
router.get('/:dealId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT content FROM deal_notes WHERE deal_id = $1', [req.params.dealId]);
    if (result.rows.length > 0) {
      res.json({ content: result.rows[0].content });
    } else {
      res.json({ content: '' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save note
router.post('/:dealId', authenticateToken, async (req, res) => {
  const { content } = req.body;
  try {
    await pool.query(`
      INSERT INTO deal_notes (deal_id, content)
      VALUES ($1, $2)
      ON CONFLICT (deal_id) DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP
    `, [req.params.dealId, content]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;