const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// @route   GET api/settings
// @desc    Get user settings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      // Return defaults if no settings exist
      return res.json({
        theme: 'dark',
        notifications_enabled: true,
        refresh_interval: 3000
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings
// @desc    Update user settings
// @access  Private
router.put('/', auth, async (req, res) => {
  const { theme, notifications_enabled, refresh_interval } = req.body;

  try {
    // Upsert settings
    await db.query(`
      INSERT INTO user_settings (user_id, theme, notifications_enabled, refresh_interval, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        theme = EXCLUDED.theme,
        notifications_enabled = EXCLUDED.notifications_enabled,
        refresh_interval = EXCLUDED.refresh_interval,
        updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, theme, notifications_enabled, refresh_interval]);

    res.json({ msg: 'Settings updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;