const pg = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Pool } = pg;

async function runMigration() {
  const sqlFile = process.argv[2];
  
  if (!sqlFile) {
    console.error('Please provide SQL file path');
    process.exit(1);
  }

  if (!fs.existsSync(sqlFile)) {
    console.error(`SQL file not found: ${sqlFile}`);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    await pool.query(sql);
    console.log(`✅ Migration completed: ${sqlFile}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();