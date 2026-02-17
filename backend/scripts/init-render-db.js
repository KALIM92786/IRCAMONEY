#!/usr/bin/env node
/**
 * One-time database initialization script for Render
 * Run this once after deployment to set up the database
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✓ Connected successfully!');

    // Check if tables already exist
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (checkResult.rows[0].exists) {
      console.log('⚠️  Database already initialized. Tables exist.');
      console.log('   If you want to reset, use the reset-render-db script instead.');
      process.exit(0);
    }

    console.log('\n📝 Creating database schema...');
    
    const schemaFiles = [
      'sql/schema.sql',
      'sql/004_goals.sql',
      'sql/006_logs.sql',
      'sql/007_sessions.sql',
      'sql/journal_schema.sql'
    ];

    for (const file of schemaFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`✓ Executed: ${file}`);
      }
    }

    // Create default admin user
    console.log('\n👤 Creating default admin user...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES ($1, $2, $3, $4)
    `, ['admin', 'admin@ircamoney.com', hashedPassword, true]);
    console.log('✓ Admin user created');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    // Insert default system settings
    console.log('\n⚙️  Configuring system settings...');
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES 
        ('sync_interval', '30000'),
        ('maintenance_mode', 'false')
    `);
    console.log('✓ System settings configured');

    console.log('\n✅ Database initialization complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
