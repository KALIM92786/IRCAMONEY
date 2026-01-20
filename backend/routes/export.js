const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');

router.get('/deals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.id, d.ticker, d.side, d.volume, d.open_price, d.close_price, d.profit, d.open_time, d.close_time
      FROM deals d
      JOIN accounts a ON d.account_id = a.id
      WHERE a.user_id = $1
      ORDER BY d.close_time DESC
    `, [req.user.id]);

    const headers = ['ID', 'Ticker', 'Side', 'Volume', 'Open Price', 'Close Price', 'Profit', 'Open Time', 'Close Time'];
    const rows = result.rows.map(row => [
      row.id, row.ticker, row.side, row.volume, row.open_price, row.close_price, row.profit, 
      new Date(row.open_time * 1000).toISOString(), 
      new Date(row.close_time * 1000).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('trading_history.csv');
    res.send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;