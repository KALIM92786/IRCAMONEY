const pool = require('../config/database').pool;
const logger = require('./logger');

class ArchiverService {
  async archiveDeals() {
    const client = await pool.connect();
    try {
      logger.info('📦 Starting trade history archival...');
      
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
      logger.info(`✅ Archived ${result.rowCount} deals older than ${daysToKeep} days.`);

    } catch (err) {
      logger.error('❌ Archival failed:', err);
    } finally {
      client.release();
    }
  }
}

module.exports = new ArchiverService();