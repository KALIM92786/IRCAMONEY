const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL is not defined.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkDb() {
  try {
    const client = await pool.connect();
    console.log('🔍 Checking Database Details...\n');
    
    try {
        const host = connectionString.includes('@') ? connectionString.split('@')[1] : 'unknown';
        console.log(`Target: ${host}\n`);
    } catch (e) {}

    // 1. List Tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('📋 Tables found:', tables.rows.map(r => r.table_name).join(', '));

    // 2. Check Users
    const users = await client.query('SELECT id, username, email, is_admin FROM users');
    console.log('\n👤 Users:', users.rows.length);
    if(users.rows.length > 0) console.table(users.rows);

    // 3. Check Broker Connections
    const brokers = await client.query('SELECT id, user_id, account_id, is_active FROM broker_connections');
    console.log('\n🔗 Broker Connections:', brokers.rows.length);
    if(brokers.rows.length > 0) console.table(brokers.rows);

    // 4. Check Accounts
    const accounts = await client.query('SELECT id, balance, equity, last_updated FROM accounts');
    console.log('\n💰 Accounts:', accounts.rows.length);
    if(accounts.rows.length > 0) {
      console.table(accounts.rows);
    } else {
      console.log('   (No accounts synced yet)');
      console.log('   👉 If the app is running, check Render logs for Sync Engine errors.');
    }

    client.release();
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

checkDb();