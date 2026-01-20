const cron = require('node-cron');
const db = require('../config/database');
const backupService = require('./backup');
const archiverService = require('./archiver');

class Scheduler {
  start() {
    console.log('Scheduler started: Daily reports enabled');

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running daily maintenance...');
        
        // 1. Cleanup old system logs (keep last 7 days)
        await db.query("DELETE FROM system_logs WHERE timestamp < NOW() - INTERVAL '7 days'");
        
        // 2. Cleanup old notifications (keep last 30 days)
        await db.query("DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days'");

        console.log('Daily maintenance completed');
      } catch (error) {
        console.error('Scheduler Error:', error);
      }
    });

    // Run Database Backup every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        await backupService.createBackup();
      } catch (error) {
        console.error('Scheduled Backup Error:', error);
      }
    });

    // Run Archiver on the 1st of every month at 3:00 AM
    cron.schedule('0 3 1 * *', async () => {
      try {
        await archiverService.archiveDeals();
      } catch (error) {
        console.error('Scheduled Archival Error:', error);
      }
    });
  }
}

module.exports = new Scheduler();