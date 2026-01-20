const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined in .env and no connection string provided');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false } // Required for Render external connections
});

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log('🔥 Resetting Database...');
    console.log(`Target: ${connectionString.split('@')[1]}`); // Log host for verification

    // 1. Drop & Recreate Schema
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    // Grant permissions (standard for Postgres 15+)
    await client.query('GRANT ALL ON SCHEMA public TO postgres');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    console.log('✅ Schema wiped.');

    // 2. Apply Schema
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✅ New schema applied.');

    // 3. Create Admin
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const adminRes = await client.query(
      `INSERT INTO users (username, password_hash, email, is_admin) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['admin', hash, 'admin@ircamoney.com', true]
    );
    const adminId = adminRes.rows[0].id;
    console.log('✅ Default admin created (admin / admin123).');

    // 4. Seed Broker Credentials from Env (if available)
    if (process.env.ROBOFOREX_ACCOUNT_ID && process.env.ROBOFOREX_API_TOKEN) {
      await client.query(
        `INSERT INTO accounts (user_id, broker_account_id, api_token) VALUES ($1, $2, $3)`,
        [adminId, process.env.ROBOFOREX_ACCOUNT_ID, process.env.ROBOFOREX_API_TOKEN]
      );
      console.log('✅ Environment credentials seeded.');
    }

    // 5. Init Settings
    await client.query("INSERT INTO system_settings (key, value) VALUES ('maintenance_mode', 'false')");
    console.log('✅ System settings initialized.');

  } catch (err) {
    console.error('❌ Reset failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();