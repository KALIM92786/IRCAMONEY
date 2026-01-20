const { Pool } = require('pg');
const fs = require('fs');
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
  ssl: { rejectUnauthorized: false } // Required for Render external connections
});

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will wipe the target database.');
    let host = 'unknown host';
    try {
      const url = new URL(connectionString);
      host = url.hostname;
    } catch (e) {
      host = connectionString.includes('@') ? connectionString.split('@')[1] : 'unknown host';
    }
    console.log('Target Host:', host);

    // 1. Drop and Recreate Schema
    console.log('🗑️  Dropping public schema...');
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');

    // 2. Read SQL Files
    const rootDir = path.resolve(__dirname, '../sql');
    const schemaFiles = [
      'schema.sql',
      'copy_trading_schema.sql',
      'journal_schema.sql',
      'margin_level_schema.sql'
    ];

    // 3. Apply Schemas
    for (const file of schemaFiles) {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Applying ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
      } else {
        if (file === 'schema.sql') {
          console.error(`❌ FATAL: Core schema file not found: ${file}. Halting.`);
          throw new Error(`Schema file not found: ${file}`);
        } else {
          console.warn(`⚠️  Warning: Optional schema file not found: ${file}. Skipping.`);
        }
      }
    }

    console.log('✅ Database reset and initialized successfully.');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
  } finally {
    await pool.end();
  }
}

resetDatabase();