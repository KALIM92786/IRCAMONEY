const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument.');
  console.error('Usage: node scripts/export-user-data.js <user_id>');
  process.exit(1);
}

async function exportUserData() {
  try {
    console.log(`Exporting data for user ID: ${userId}...`);
    const client = await pool.connect();

    const data = {};

    // Users
    const userRes = await client.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      console.error('User not found.');
      process.exit(1);
    }
    data.user = userRes.rows[0];

    // Accounts
    const accountsRes = await client.query('SELECT * FROM accounts WHERE user_id = $1', [userId]);
    data.accounts = accountsRes.rows;

    // Settings
    const settingsRes = await client.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    data.settings = settingsRes.rows[0] || {};

    // Notifications
    const notifRes = await client.query('SELECT * FROM notifications WHERE user_id = $1', [userId]);
    data.notifications = notifRes.rows;

    // Activity Logs
    const activityRes = await client.query('SELECT * FROM activity_logs WHERE user_id = $1', [userId]);
    data.activity_logs = activityRes.rows;

    // Trading Goals
    const goalsRes = await client.query('SELECT * FROM trading_goals WHERE user_id = $1', [userId]);
    data.trading_goals = goalsRes.rows;

    // Broker Connections (Exclude sensitive token if needed, but GDPR usually requires full data access)
    // We will mask the token for safety in this export script unless explicitly needed
    const connRes = await client.query('SELECT id, broker_name, account_id, is_active, created_at FROM broker_connections WHERE user_id = $1', [userId]);
    data.broker_connections = connRes.rows;

    // Write to file
    const filename = `user_export_${userId}_${Date.now()}.json`;
    const outputPath = path.join(__dirname, '..', filename);
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`Data exported successfully to ${outputPath}`);
    
    client.release();
  } catch (err) {
    console.error('Error exporting data:', err);
  } finally {
    await pool.end();
  }
}

exportUserData();