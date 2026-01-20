const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class BackupService {
  constructor() {
    // Store backups in backend/backups
    this.backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);
    
    const dbUrl = process.env.DATABASE_URL;
    
    // Command to dump database using pg_dump
    // Note: pg_dump must be installed in the environment (Dockerfile adds postgresql-client)
    const cmd = `pg_dump "${dbUrl}" -f "${filepath}"`;

    return new Promise((resolve, reject) => {
      logger.info('Starting database backup...');
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error('Backup failed:', error);
          return reject(error);
        }
        logger.info(`Backup created successfully: ${filename}`);
        
        // Clean up old backups after successful creation
        this.cleanupOldBackups();
        
        resolve({ filename, filepath, timestamp });
      });
    });
  }

  cleanupOldBackups() {
    // Keep backups for 7 days
    const retentionDays = 7;
    const now = Date.now();

    fs.readdir(this.backupDir, (err, files) => {
      if (err) return;
      
      files.forEach(file => {
        if (!file.startsWith('backup-') || !file.endsWith('.sql')) return;
        
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const daysOld = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        
        if (daysOld > retentionDays) {
          fs.unlink(filePath, err => {
            if (!err) logger.info(`Deleted old backup: ${file}`);
          });
        }
      });
    });
  }
}

module.exports = new BackupService();