const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not defined. Please check your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Check if admin exists
    const res = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    
    if (res.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        "INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4)",
        ['admin', 'admin@ircamoney.com', hashedPassword, true]
      );
      console.log('Default admin user created: admin / admin123');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();