const express = require('express');
const router = express.Router();
const db = require('../config/database');
const syncEngine = require('../services/syncEngine');
const auth = require('../middleware/auth');
const axios = require('axios');

// GET /api/account - List all accounts for the user
router.get('/', auth, async (req, res) => {
  try {
    // Filter by req.user.id
    const result = await db.query('SELECT * FROM accounts WHERE user_id = $1 ORDER BY last_updated DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/account/:id - Get specific account details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/account/:id/orders - Get active orders
router.get('/:id/orders', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const accountCheck = await db.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (accountCheck.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    const result = await db.query(
      'SELECT * FROM orders WHERE account_id = $1 AND status = $2 ORDER BY last_modified DESC', 
      [id, 'active']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/account/:id/deals - Get trading history
router.get('/:id/deals', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const accountCheck = await db.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (accountCheck.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    const limit = parseInt(req.query.limit) || 50;
    
    const result = await db.query(
      'SELECT * FROM deals WHERE account_id = $1 ORDER BY close_time DESC LIMIT $2', 
      [id, limit]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/account/:id/archived-deals - Get archived trading history
router.get('/:id/archived-deals', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const accountCheck = await db.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (accountCheck.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    const limit = parseInt(req.query.limit) || 100;
    
    // Check if archive table exists first to avoid error on fresh install
    const tableCheck = await db.query("SELECT to_regclass('public.deals_archive')");
    if (!tableCheck.rows[0].to_regclass) return res.json([]);

    const result = await db.query(
      'SELECT * FROM deals_archive WHERE account_id = $1 ORDER BY close_time DESC LIMIT $2', 
      [id, limit]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/account/:id/sync - Force manual sync
router.post('/:id/sync', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await db.query('SELECT * FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    
    if (account.rows.length > 0) {
      await syncEngine.syncAccount(account.rows[0]);
      res.json({ message: 'Sync completed successfully' });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sync failed: ' + error.message });
  }
});

// GET /api/account/:id/equity - Get equity history for charts
router.get('/:id/equity', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const accountCheck = await db.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (accountCheck.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    // Get last 100 data points
    const result = await db.query(
      'SELECT * FROM (SELECT * FROM equity_snapshots WHERE account_id = $1 ORDER BY timestamp DESC LIMIT 100) sub ORDER BY timestamp ASC', 
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/account/fetch-from-broker - Fetch all accounts from broker and save to DB
router.post('/fetch-from-broker', auth, async (req, res) => {
  try {
    // 1. Get API Token for the user
    const conn = await db.query('SELECT api_token FROM broker_connections WHERE user_id = $1', [req.user.id]);
    
    if (conn.rows.length === 0) {
      return res.status(400).json({ error: 'No broker connection found. Please save credentials first.' });
    }
    
    const { api_token } = conn.rows[0];
    const apiUrl = process.env.ROBOFOREX_API_URL || 'https://api.stockstrader.com';
    const baseUrl = `${apiUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '')}/api/v1`;

    // 2. Fetch Accounts from Broker
    const response = await axios.get(`${baseUrl}/accounts`, {
      headers: { 'Authorization': `Bearer ${api_token}` }
    });

    if (response.data.code !== 'ok') {
      throw new Error('Broker API returned error: ' + JSON.stringify(response.data));
    }

    const accounts = response.data.data || [];
    let count = 0;

    // 3. Upsert into DB
    for (const acc of accounts) {
      await db.query(`
        INSERT INTO accounts (id, user_id, name, type, system, currency, status, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          system = EXCLUDED.system,
          currency = EXCLUDED.currency,
          status = EXCLUDED.status,
          last_updated = CURRENT_TIMESTAMP
      `, [String(acc.id), req.user.id, acc.name, acc.type, acc.system, acc.currency, acc.status]);
      count++;
    }

    res.json({ success: true, message: `Successfully synced ${count} accounts from broker.` });
  } catch (error) {
    console.error('Error fetching accounts from broker:', error);
    res.status(500).json({ error: 'Failed to fetch accounts: ' + (error.response?.data?.msg || error.message) });
  }
});

// DELETE /api/account/:id/orders/:orderId - Close/Cancel an order
router.delete('/:id/orders/:orderId', auth, async (req, res) => {
  try {
    const { id, orderId } = req.params;
    
    // Verify ownership
    const accountCheck = await db.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (accountCheck.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    // Get credentials
    const conn = await db.query('SELECT api_token FROM broker_connections WHERE account_id = $1', [id]);
    if (conn.rows.length === 0) return res.status(400).json({ error: 'Broker connection not found' });

    const RoboForexAPI = require('../services/robforex');
    const api = new RoboForexAPI(id, conn.rows[0].api_token);
    
    await api.closeOrder(orderId);
    
    res.json({ success: true, message: 'Order close requested' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close order: ' + error.message });
  }
});

// DELETE /api/account/:id/orders - Bulk Close Orders
router.delete('/:id/orders', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { ticker } = req.query;
    
    // Verify ownership
    const accountCheck = await db.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (accountCheck.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

    // Get credentials
    const conn = await db.query('SELECT api_token FROM broker_connections WHERE account_id = $1', [id]);
    if (conn.rows.length === 0) return res.status(400).json({ error: 'Broker connection not found' });

    const RoboForexAPI = require('../services/robforex');
    const api = new RoboForexAPI(id, conn.rows[0].api_token);
    
    // Get active orders from DB to know IDs
    let query = 'SELECT id FROM orders WHERE account_id = $1 AND status = $2';
    const params = [id, 'active'];
    
    if (ticker) {
      query += ' AND ticker = $3';
      params.push(ticker);
    }
    
    const orders = await db.query(query, params);
    
    const results = { success: 0, failed: 0 };
    
    // Process in parallel chunks to avoid timeout but not overwhelm API
    const chunkSize = 5;
    for (let i = 0; i < orders.rows.length; i += chunkSize) {
      const chunk = orders.rows.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (order) => {
        try {
          await api.closeOrder(order.id);
          results.success++;
        } catch (e) {
          console.error(`Failed to close ${order.id}:`, e.message);
          results.failed++;
        }
      }));
    }
    
    res.json({ success: true, results, message: `Closed ${results.success} orders. Failed: ${results.failed}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close orders: ' + error.message });
  }
});

module.exports = router;