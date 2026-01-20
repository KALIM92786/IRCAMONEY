const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

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
    if (process.env.ROBOFOREX_ACCOUNT_ID && process.env.ROBOFOREX_API_TOKEN) {
      // Inserts credentials into the correct table `broker_connections`
      // and relies on the UNIQUE (user_id, account_id) constraint for idempotency.
      await client.query(`
        INSERT INTO broker_connections (user_id, account_id, api_token) 
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, account_id) DO UPDATE 
        SET api_token = EXCLUDED.api_token, updated_at = CURRENT_TIMESTAMP;
      `, [adminId, process.env.ROBOFOREX_ACCOUNT_ID, process.env.ROBOFOREX_API_TOKEN]);
      console.log('✅ Broker connection credentials seeded.');
    } else {
      console.log('ℹ️  Skipping broker credentials seeding (not found in .env).');
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