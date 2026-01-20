const express = require('express');
const router = express.Router();

// Simple support endpoint
router.post('/', (req, res) => {
  // In a real app, this would send an email or create a ticket
  console.log('Support request received:', req.body);
  res.json({ success: true, message: 'Support request received' });
});

module.exports = router;