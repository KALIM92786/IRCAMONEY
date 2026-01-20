const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
const dotenvResult = require('dotenv').config({ path: envPath });

if (dotenvResult.error) {
  console.log(`⚠️  .env file not found at: ${envPath}`);
} else {
  console.log(`📄 Loaded .env from: ${envPath}`);
}

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL is not defined in .env and no connection string provided.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database with initial data...');
    let host = 'unknown host';
    try {
      const url = new URL(connectionString);
      host = url.hostname;
    } catch (e) {
      host = connectionString.includes('@') ? connectionString.split('@')[1] : 'unknown host';
    }
    console.log('Target Host:', host);
    
    // 1. Seed Admin User (Idempotent)
    const adminRes = await client.query("SELECT id FROM users WHERE username = 'admin'");
    let adminId;

    if (adminRes.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await client.query(
        "INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id",
        ['admin', 'admin@ircamoney.com', hashedPassword, true]
      );
      adminId = newAdmin.rows[0].id;
      console.log('✅ Default admin user created (admin / admin123).');
    } else {
      adminId = adminRes.rows[0].id;
      console.log('ℹ️  Admin user already exists.');
    }

    // 2. Seed System Settings (Idempotent)
    await client.query(`
      INSERT INTO system_settings (key, value) 
      VALUES ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ System settings initialized.');

    // 3. Seed Broker Credentials from Env (Idempotent)
    const accountId = process.env.ROBOFOREX_ACCOUNT_ID;
    const apiToken = process.env.ROBOFOREX_API_TOKEN;

    if (accountId && apiToken) {
      const isAccountIdPlaceholder = accountId.includes('your_account_id');
      const isApiTokenPlaceholder = apiToken.includes('your_api_token');
      if (isAccountIdPlaceholder || isApiTokenPlaceholder) {
        console.warn('⚠️  Skipping broker seeding: Credentials in .env appear to be placeholders.');
      } else {
        // Inserts credentials into the correct table `broker_connections`
        // and relies on the UNIQUE (user_id, account_id) constraint for idempotency.
        await client.query(`
          INSERT INTO broker_connections (user_id, account_id, api_token) 
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, account_id) DO UPDATE 
          SET api_token = EXCLUDED.api_token, updated_at = CURRENT_TIMESTAMP;
        `, [adminId, accountId, apiToken]);
        console.log('✅ Broker connection credentials seeded.');
      }
    } else {
      console.log('ℹ️  Skipping broker credentials seeding.');
      if (!accountId) console.log('   ❌ ROBOFOREX_ACCOUNT_ID is missing');
      if (!apiToken) console.log('   ❌ ROBOFOREX_API_TOKEN is missing');

      console.warn('⚠️  WARNING: Database will have NO broker connections.');
      console.warn('   The application may crash or fail to sync without a connected account.');
      console.warn('   Please ensure these variables are set in your .env file.');
    }

    console.log('🌿 Seeding complete.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();