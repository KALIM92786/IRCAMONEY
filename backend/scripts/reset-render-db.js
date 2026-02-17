const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Use the Render database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://ircamoneydb:Xj9cNugoun0VFdxGzvoBIO9W6uXD4oMq@dpg-d68tsibnv86c73el0530-a.oregon-postgres.render.com/ircamoneydb_5qn4';

async function resetDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Render database...');
    await client.connect();
    console.log('Connected successfully!');

    // Drop all tables in correct order (respecting foreign keys)
    console.log('\n🗑️  Dropping existing tables...');
    const dropTables = [
      'equity_snapshots',
      'deals',
      'orders',
      'quotes',
      'broker_connections',
      'accounts',
      'activity_logs',
      'user_sessions',
      'goals',
      'system_logs',
      'system_settings',
      'users'
    ];

    for (const table of dropTables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (err) {
        console.log(`⚠️  Could not drop ${table}: ${err.message}`);
      }
    }

    // Drop functions and triggers
    console.log('\n🗑️  Dropping functions and triggers...');
    await client.query('DROP FUNCTION IF EXISTS set_default_account_id() CASCADE');
    console.log('✓ Dropped functions');

    // Create tables from schema files
    console.log('\n📝 Creating tables from schema...');
    
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
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    }

    // Create default admin user
    console.log('\n👤 Creating default admin user...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@ircamoney.com', hashedPassword, true]);
    console.log('✓ Admin user created (username: admin, password: admin123)');

    // Insert default system settings
    console.log('\n⚙️  Setting up system settings...');
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES 
        ('sync_interval', '30000'),
        ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('✓ System settings configured');

    console.log('\n✅ Database reset and initialization complete!');
    console.log('\n📊 Database Summary:');
    
    // Show table counts
    const tables = ['users', 'accounts', 'orders', 'deals', 'goals'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} rows`);
      } catch (err) {
        console.log(`   ${table}: table not found`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

resetDatabase();
