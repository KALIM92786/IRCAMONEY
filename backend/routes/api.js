const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const roboForex = require('../services/robforex');

router.use(auth);

router.get('/account', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM accounts ORDER BY last_updated DESC LIMIT 1');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY open_time DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { accountId, ticker, side, volume } = req.body;
    // Use the account ID provided or fallback to env default if not multi-tenant
    const targetAccount = accountId || process.env.ROBOFOREX_ACCOUNT_ID;
    
    const result = await roboForex.placeOrder(targetAccount, ticker, side, volume);
    
    if (result) {
      res.json({ message: 'Order placed successfully', order: result });
    } else {
      res.status(400).json({ message: 'Failed to place order' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const targetAccount = process.env.ROBOFOREX_ACCOUNT_ID; // Or fetch from DB based on order ownership
    
    await roboForex.closeOrder(targetAccount, id);
    res.json({ message: 'Order closed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM deals ORDER BY close_time DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/equity-history', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM equity_snapshots ORDER BY timestamp ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    // Aggregate performance metrics per account
    const query = `
      SELECT 
        a.id,
        a.name,
        SUM(d.profit) as profit,
        COUNT(d.id) as total_trades,
        ROUND((SUM(CASE WHEN d.profit > 0 THEN 1 ELSE 0 END)::numeric / COUNT(d.id) * 100), 1) as "winRate"
      FROM deals d
      JOIN accounts a ON d.account_id = a.id
      GROUP BY a.id, a.name
      ORDER BY profit DESC
      LIMIT 10
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trades/archived', async (req, res) => {
  try {
    // Fetch deals older than 30 days
    const result = await db.query("SELECT * FROM deals WHERE close_time < NOW() - INTERVAL '30 days' ORDER BY close_time DESC LIMIT 100");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/copy-trading/settings', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM copy_settings WHERE user_id = $1', [req.userData.userId]);
    if (result.rows.length === 0) {
      return res.json({});
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/copy-trading/settings', async (req, res) => {
  try {
    const { masterAccount, slaveAccount, multiplier } = req.body;
    const userId = req.userData.userId;

    const query = `
      INSERT INTO copy_settings (user_id, master_account_id, slave_account_id, multiplier, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        master_account_id = EXCLUDED.master_account_id,
        slave_account_id = EXCLUDED.slave_account_id,
        multiplier = EXCLUDED.multiplier,
        updated_at = NOW()
    `;
    
    await db.query(query, [userId, masterAccount, slaveAccount, multiplier]);
    res.json({ message: 'Copy trading settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/daily', async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(close_time, 'YYYY-MM-DD') as date,
        SUM(profit) as profit,
        COUNT(*) as trades
      FROM deals
      WHERE close_time > NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/strategy', async (req, res) => {
  try {
    const query = `
      SELECT
        SUM(profit) as "netProfit",
        COUNT(*) as "totalTrades",
        SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN profit <= 0 THEN 1 ELSE 0 END) as losses,
        ROUND((SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as "winRate"
      FROM deals
    `;
    const result = await db.query(query);
    const stats = result.rows[0] || {};
    
    // Calculate Profit Factor
    const grossQuery = `
      SELECT 
        SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END) as "grossProfit",
        ABS(SUM(CASE WHEN profit < 0 THEN profit ELSE 0 END)) as "grossLoss"
      FROM deals
    `;
    const grossResult = await db.query(grossQuery);
    const { grossProfit, grossLoss } = grossResult.rows[0] || { grossProfit: 0, grossLoss: 0 };
    
    stats.profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '∞';
    stats.netProfit = stats.netProfit || 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/journal', async (req, res) => {
  try {
    // Fetch deals that have notes, or recent deals to allow annotation
    const query = `
      SELECT * FROM deals 
      WHERE notes IS NOT NULL OR close_time > NOW() - INTERVAL '30 days'
      ORDER BY close_time DESC
      LIMIT 50
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/deals/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    await db.query('UPDATE deals SET notes = $1 WHERE id = $2', [notes, id]);
    res.json({ message: 'Journal entry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;