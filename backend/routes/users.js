const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// @route   GET api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    const result = await db.query('SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  const { email, password } = req.body;
  const userId = req.user.id;

  try {
    // Build update query dynamically
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    let paramCount = 1;

    if (email) {
      query += `, email = $${paramCount}`;
      params.push(email);
      paramCount++;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      query += `, password_hash = $${paramCount}`;
      params.push(hash);
      paramCount++;
    }

    // Add WHERE clause
    query += ` WHERE id = $${paramCount}`;
    params.push(userId);

    await db.query(query, params);

    // Fetch updated user
    const updatedUser = await db.query('SELECT id, username, email, is_admin, avatar FROM users WHERE id = $1', [userId]);
    
    res.json({ success: true, user: updatedUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/me
// @desc    Delete current user and all associated data
// @access  Private
router.delete('/me', auth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const userId = req.user.id;

    // 1. Get accounts to delete related trading data
    const accounts = await client.query('SELECT id FROM accounts WHERE user_id = $1', [userId]);
    const accountIds = accounts.rows.map(a => a.id);

    if (accountIds.length > 0) {
      await client.query('DELETE FROM orders WHERE account_id = ANY($1)', [accountIds]);
      await client.query('DELETE FROM deals WHERE account_id = ANY($1)', [accountIds]);
      await client.query('DELETE FROM quotes WHERE account_id = ANY($1)', [accountIds]);
      await client.query('DELETE FROM equity_snapshots WHERE account_id = ANY($1)', [accountIds]);
    }

    // 2. Delete user related data
    await client.query('DELETE FROM broker_connections WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM user_settings WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM trading_goals WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM watchlist_items WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM activity_logs WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM copy_trading_rules WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM accounts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Account and all data permanently deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Server Error during deletion' });
  } finally {
    client.release();
  }
});

module.exports = router;