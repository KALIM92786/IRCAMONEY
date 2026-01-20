const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  try {
    console.log('Seeding database...');
    const client = await pool.connect();

    // 1. Create Test User
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    const userRes = await client.query(`
      INSERT INTO users (username, email, password_hash, is_verified)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `, ['testuser', 'test@example.com', hash, true]);
    
    const userId = userRes.rows[0].id;
    console.log(`Test user created/updated (ID: ${userId})`);

    // 2. Create Dummy Account
    const accountId = '99999999';
    await client.query(`
      INSERT INTO accounts (id, user_id, name, type, system, currency, status, balance, equity, margin, free_margin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING
    `, [accountId, userId, 'Demo Account', 'demo', 'hedging', 'USD', 'enabled', 10000, 10250, 500, 9750]);
    console.log(`Dummy account created (ID: ${accountId})`);

    // 3. Create Dummy Orders
    await client.query(`
      INSERT INTO orders (id, account_id, ticker, volume, side, type, price, status, create_time)
      VALUES 
      ($1, $2, 'EURUSD', 1.0, 'buy', 'market', 1.0850, 'active', $3),
      ($4, $2, 'XAUUSD', 0.5, 'sell', 'limit', 2050.00, 'active', $3)
      ON CONFLICT (id) DO NOTHING
    `, ['ord_1', accountId, Math.floor(Date.now() / 1000), 'ord_2']);
    console.log('Dummy orders created');

    // 4. Create Dummy Deals (History)
    await client.query(`
      INSERT INTO deals (id, account_id, ticker, volume, side, open_price, close_price, profit, open_time, close_time, status)
      VALUES 
      ($1, $2, 'GBPUSD', 1.0, 'buy', 1.2600, 1.2650, 500.00, $3, $4, 'filled'),
      ($5, $2, 'USDJPY', 2.0, 'sell', 148.00, 147.50, 1000.00, $3, $4, 'filled')
      ON CONFLICT (id) DO NOTHING
    `, ['deal_1', accountId, Math.floor(Date.now() / 1000) - 86400, Math.floor(Date.now() / 1000), 'deal_2']);
    console.log('Dummy deals created');

    // 5. Create Equity Snapshots (for chart)
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 24; i++) {
      const time = now - (i * 3600);
      const equity = 10000 + (Math.random() * 500);
      await client.query(`
        INSERT INTO equity_snapshots (account_id, equity, balance, margin, profit, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [accountId, equity, 10000, 500, equity - 10000, time]);
    }
    console.log('Dummy equity history created');

    client.release();
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();