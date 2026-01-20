const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not defined. Please check your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render external connections
});

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will wipe the database defined in DATABASE_URL.');
    console.log('Target:', process.env.DATABASE_URL.split('@')[1]); // Log host only for safety

    // 1. Drop and Recreate Schema
    console.log('🗑️  Dropping public schema...');
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

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
        throw new Error(`Schema file not found: ${filePath}`);
      }
    }

    console.log('✅ Database reset and initialized successfully.');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase();