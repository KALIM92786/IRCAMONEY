const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend directory
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  // Check for Internal Render URL usage locally
  if (dbUrl.includes('dpg-') && !dbUrl.includes('.render.com')) {
    console.error('❌ DETECTED INTERNAL URL: You are using a Render Internal URL locally.');
    console.error('   Please update your .env file with the External Database URL.');
    console.error('   Format: postgresql://user:pass@hostname.region.render.com/dbname');
    process.exit(1);
  }

  try {
    const url = new URL(dbUrl);
    const targetDbName = url.pathname.substring(1); // Remove leading slash
    
    // Connect to 'postgres' system database to execute CREATE DATABASE
    url.pathname = '/postgres';
    const postgresUrl = url.toString();

    console.log(`Target Database: ${targetDbName}`);
    
    const client = new Client({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false } // Required for Render External connections
    });

    await client.connect();

    // Check if database exists
    const checkRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (checkRes.rowCount === 0) {
      console.log(`Creating database "${targetDbName}"...`);
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.log('✅ Database created successfully.');
    } else {
      console.log(`ℹ️  Database "${targetDbName}" already exists.`);
    }

    await client.end();
  } catch (err) {
    console.error('❌ Failed to create database:', err.message);
    if (err.code === 'ENOTFOUND') {
        console.error('   Host not found. Check your DATABASE_URL in .env');
        console.error('   Make sure you are using the External Database URL (ending in .render.com)');
    }
    process.exit(1);
  }
}

createDatabase();