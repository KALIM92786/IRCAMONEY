const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function archiveDeals() {
  const client = await pool.connect();
  try {
    console.log('📦 Starting trade history archival...');
    
    // 1. Create Archive Table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS deals_archive (
        LIKE deals INCLUDING ALL
      );
    `);

    // 2. Move old deals (older than 90 days)
    const daysToKeep = 90;
    const moveQuery = `
      WITH moved_rows AS (
        DELETE FROM deals
        WHERE close_time < extract(epoch from (NOW() - INTERVAL '${daysToKeep} days'))
        RETURNING *
      )
      INSERT INTO deals_archive
      SELECT * FROM moved_rows;
    `;

    const result = await client.query(moveQuery);
    console.log(`✅ Archived ${result.rowCount} deals older than ${daysToKeep} days.`);

    // 3. Optimize table (optional, for reclaiming space)
    // await client.query('VACUUM deals'); 

  } catch (err) {
    console.error('❌ Archival failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

archiveDeals();