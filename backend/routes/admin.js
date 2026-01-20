const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Protect all admin routes
router.use(auth);
router.use(admin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, is_admin as "isAdmin", created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user admin status
router.post('/users/:id/toggle-role', async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent modifying self
    if (id === req.userData.userId) {
      return res.status(400).json({ message: 'Cannot modify your own role' });
    }
    
    const result = await db.query(
      'UPDATE users SET is_admin = NOT is_admin WHERE id = $1 RETURNING id, is_admin',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.userData.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;