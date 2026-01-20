const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database').pool;
const authenticateToken = require('../middleware/auth');
const backupService = require('../services/backup');
const syncEngine = require('../services/syncEngine');
const axios = require('axios');

router.get('/maintenance', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM system_settings WHERE key = 'maintenance_mode'");
    res.json({ maintenance: result.rows.length > 0 && result.rows[0].value === 'true' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/maintenance', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
  
  const { enabled } = req.body;
  try {
    await pool.query(`
      INSERT INTO system_settings (key, value) VALUES ('maintenance_mode', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `, [String(enabled)]);
    
    // Update global variable in memory (if running in same process)
    if (global) global.isMaintenanceMode = enabled;
    
    res.json({ success: true, maintenance: enabled });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Trigger Manual Backup (Admin only)
router.post('/backup', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });

  try {
    const result = await backupService.createBackup();
    res.json({ success: true, message: 'Backup created successfully', file: result.filename });
  } catch (error) {
    res.status(500).json({ error: 'Backup failed: ' + error.message });
  }
});

// List backups (Admin only)
router.get('/backups', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
  
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) return res.json([]);
  
  try {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return { name: f, size: stats.size, created: stats.birthtime };
      })
      .sort((a, b) => b.created - a.created);
      
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Download backup (Admin only)
router.get('/backups/:filename', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
  
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../backups', filename);
  
  if (!filename.endsWith('.sql') || !fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.download(filepath);
});

// Restart Sync Engine (Admin only)
router.post('/sync/restart', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });

  try {
    syncEngine.consecutiveAuthErrors = 0;
    const io = req.app.get('io');
    await syncEngine.start(io);
    res.json({ success: true, message: 'Sync Engine restarted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restart Sync Engine: ' + error.message });
  }
});

// Detailed System Health Check (Admin only)
router.get('/health-detailed', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });

  const health = {
    database: 'unknown',
    broker_api: 'unknown',
    sync_engine: syncEngine.isRunning ? 'running' : 'stopped',
    timestamp: new Date()
  };

  // Check Database
  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (e) {
    health.database = 'disconnected';
  }

  // Check Broker API (Ping)
  try {
    const apiUrl = process.env.ROBOFOREX_API_URL || 'https://api.stockstrader.com';
    // Just checking if the domain is reachable, not a specific authenticated endpoint
    await axios.head(apiUrl, { timeout: 2000 });
    health.broker_api = 'reachable';
  } catch (e) {
    health.broker_api = 'unreachable';
  }

  res.json(health);
});

module.exports = router;