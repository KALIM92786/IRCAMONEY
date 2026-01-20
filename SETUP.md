# IRCAMONEY - Quick Setup Guide

Get IRCAMONEY running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 13+ installed and running
- RoboForex account with API access (optional for initial testing)

## 🚀 Quick Setup (5 minutes)

### Step 1: Database Setup (2 minutes)

```bash
# Create database
createdb ircamoney

# Verify database created
psql -l | grep ircamoney
```

### Step 2: Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env file
nano .env
```

**Required .env values:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://$(whoami):@localhost:5432/ircamoney
JWT_SECRET=<paste_generated_secret_here>
```

**Optional (for real data):**
```env
ROBOFOREX_ACCOUNT_ID=your_account_id
ROBOFOREX_API_TOKEN=your_api_token
```

### Step 3: Initialize Database (1 minute)

```bash
# Reset database with schema
npm run db:reset

# Seed with default user
npm run seed
```

Expected output:
```
✅ Database reset completed
✅ Database seeded successfully
Default user created:
Username: admin
Password: admin123
```

### Step 4: Frontend Setup (1 minute)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Frontend .env:**
```env
VITE_API_URL=http://localhost:3000
```

### Step 5: Run Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 3000
Database connected
Sync engine started
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 6: Access Application

1. Open browser: http://localhost:5173
2. Login with: `admin` / `admin123`
3. You should see the Dashboard

## ✅ Verification

### Check Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Check Database Connection

```bash
psql ircamoney -c "\dt"
```

Expected tables:
- users
- accounts
- orders
- deals
- equity_snapshots
- system_logs
- broker_connections

### Test API Endpoints

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for WebSocket connection message
4. No red errors should appear

## 🔧 Troubleshooting

### Database Connection Error

**Problem:** `connection refused` or `authentication failed`

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql postgres://$(whoami)@localhost:5432/ircamoney

# If password required, update .env:
DATABASE_URL=postgresql://$(whoami):password@localhost:5432/ircamoney
```

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process (replace PID)
kill -9 <PID>

# Or use different PORT in .env
PORT=3001
```

### Module Not Found

**Problem:** `Cannot find module '...'`

**Solution:**
```bash
cd backend
npm install

cd ../frontend
npm install
```

### PostgreSQL Command Not Found

**Problem:** `psql: command not found`

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Download from postgresql.org
```

### Database Already Exists

**Problem:** `database "ircamoney" already exists`

**Solution:**
```bash
# Drop and recreate
dropdb ircamoney
createdb ircamoney

# Or use different name
createdb ircamoney_test
# Update DATABASE_URL in .env
```

### No Data Showing

**Problem:** Dashboard shows zeros or no data

**Solution:**
1. Without RoboForex API: This is normal - demo mode
2. With API credentials:
   - Check credentials in .env
   - Verify account_id is correct
   - Check backend logs for API errors
   - Wait 3-5 seconds for first sync

## 🎯 Getting RoboForex Credentials

### Step 1: Login to RoboForex

1. Go to [RoboForex](https://www.roboforex.com/)
2. Login to your account
3. Navigate to **StocksTrader** platform

### Step 2: Get Account ID

1. In StocksTrader, look for account information
2. Copy your Account ID (usually 8 digits)
3. Example: `12345678`

### Step 3: Generate API Token

1. Go to Settings → API or Profile
2. Click "Generate New Token"
3. Give it a name (e.g., "IRCAMONEY")
4. Copy the generated token

### Step 4: Update .env

```bash
cd backend
nano .env

# Add:
ROBOFOREX_ACCOUNT_ID=12345678
ROBOFOREX_API_TOKEN=your_generated_token_here
```

### Step 5: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Start again
npm run dev
```

## 📱 Testing Real Data

After adding RoboForex credentials:

1. Wait 3-5 seconds for first sync
2. Refresh Dashboard
3. You should see real account data
4. Check Open Trades page
5. Check Trade History page
6. View Equity Curve chart

## 🔐 Security Notes

### Change Default Password

```bash
# In browser, go to Settings
# Or update in database:
psql ircamoney -c "
UPDATE users 
SET password_hash = '\$2b\$10\$new_hash_here'
WHERE username = 'admin';
"
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Never Commit .env Files

Ensure `.gitignore` includes:
```
.env
.env.local
.env.*.local
```

## 🚀 Common Commands

**Backend:**
```bash
npm install          # Install dependencies
npm run dev          # Development mode
npm start            # Production mode
npm run seed         # Seed database
npm run db:reset     # Reset database
npm run verify       # Verify setup
```

**Frontend:**
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Database:**
```bash
createdb ircamoney  # Create database
dropdb ircamoney    # Drop database
psql ircamoney      # Connect to database
psql -l             # List all databases
```

## 📊 Project Structure

```
IRCAMONEY/
├── backend/                 # Node.js backend
│   ├── config/             # Database config
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── services/           # Sync engine, API client
│   ├── scripts/            # Utility scripts
│   ├── sql/                # Database schema
│   └── server.js           # Main server
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # Entry point
│   └── vite.config.js      # Vite config
├── README.md               # Main documentation
├── SETUP.md                # This file
├── DEPLOYMENT.md           # Deployment guide
└── render.yaml             # Render blueprint
```

## 🎓 Next Steps

1. ✅ Setup complete
2. 📖 Read [README.md](README.md) for full documentation
3. 🚀 Deploy to Render using [DEPLOYMENT.md](DEPLOYMENT.md)
4. 🔒 Change default password
5. 📊 Add RoboForex credentials for real data
6. 🎨 Customize the UI to your needs

## 💡 Tips

- **Demo Mode**: Without API credentials, app runs in demo mode
- **Sync Interval**: Default is 3 seconds, can be adjusted
- **WebSocket**: Real-time updates via WebSocket
- **Mobile First**: Test on mobile devices too
- **Hot Reload**: Both frontend and backend support hot reload

## 📞 Need Help?

- Check [README.md](README.md) for detailed docs
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Check browser console for errors
- Review backend logs for API issues
- Verify database connection

---

**Setup Complete!** 🎉 Your IRCAMONEY platform is now running locally.