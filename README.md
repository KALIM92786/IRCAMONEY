# IRCAMONEY - RoboForex Trading Mirror Platform

A production-ready fintech platform that mirrors live RoboForex trading account data in real-time.

## 🚀 Features

- **Real-Time Data Sync**: Syncs with RoboForex API every 3 seconds
- **Live WebSocket Streaming**: Real-time price, equity, and trade updates
- **Mobile-First Design**: Responsive web interface optimized for all devices
- **Complete Trading Dashboard**: View balance, equity, margin, and open trades
- **Trade History**: Track all your closed deals
- **Equity Curve Visualization**: Interactive charts showing account performance
- **Authentication System**: Secure JWT-based authentication
- **PostgreSQL Database**: Persistent storage with automatic cleanup
- **Production-Ready**: Error handling, logging, health checks

## 📋 Requirements

- Node.js 18+
- PostgreSQL 13+
- RoboForex Account with API access

## 🔧 Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/KALIM92786/IRCAMONEY.git
cd IRCAMONEY

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
```

### 2. Database Setup

```bash
# Create database
createdb ircamoney

# Run schema
cd backend
npm run db:reset
npm run seed
```

### 3. Configure Environment

**Backend (.env):**
```env
ROBOFOREX_ACCOUNT_ID=your_account_id
ROBOFOREX_API_TOKEN=your_api_token
DATABASE_URL=postgresql://user:pass@localhost:5432/ircamoney
JWT_SECRET=generate_a_secure_random_string
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

### 4. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Login: `admin` / `admin123`

## 🌐 Deploy to Render

### Automated Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository
   - Select `render.yaml`
   - Click **Apply Blueprint**

3. **Configure RoboForex Credentials:**
   - Go to backend service → Environment
   - Add `ROBOFOREX_ACCOUNT_ID` and `ROBOFOREX_API_TOKEN`
   - Save changes

### Manual Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed manual deployment instructions.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Trading Data
- `GET /api/account` - Get account information
- `GET /api/orders` - Get orders (query: status)
- `GET /api/deals` - Get deals (query: status)
- `GET /api/equity-history` - Get equity history (query: hours)
- `GET /api/quote/:ticker` - Get quote for ticker

### Health Check
- `GET /health` - Service health status

## 🔄 WebSocket Events

**Server → Client:**
- `account_update` - Account state updates
- `orders_update` - Open orders updates
- `deals_update` - Trade history updates
- `price_update` - Live price updates

## 📊 Database Schema

### Tables:
- `users` - User accounts with UUID primary keys
- `accounts` - Trading account information
- `orders` - Open positions
- `deals` - Closed deals history
- `equity_snapshots` - Historical equity data
- `system_logs` - Application logs
- `broker_connections` - API token management

### Features:
- UUID primary keys for users
- Automatic `updated_at` timestamps
- Performance indexes
- Foreign key relationships
- Data type validation

## 🔒 Security

- JWT-based authentication with bcrypt password hashing
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- SQL injection prevention
- Environment variable management

## 📄 Documentation

- [SETUP.md](SETUP.md) - Quick setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Render deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [USER_MANUAL.md](USER_MANUAL.md) - User guide
- [ADMIN_MANUAL.md](ADMIN_MANUAL.md) - Admin guide

## 🛠️ Tech Stack

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- PostgreSQL with pg library
- JWT for authentication
- Axios for API requests
- Helmet.js for security
- Morgan for logging

### Frontend
- React 18 with Vite
- Recharts for data visualization
- Socket.IO Client
- React Router v6
- Lucide React for icons
- Tailwind CSS

## 📝 Scripts

**Backend:**
```bash
npm start          # Production mode
npm run dev        # Development mode
npm run seed       # Seed database
npm run db:reset   # Reset database
npm run migrate    # Run migration
npm run verify     # Verify setup
```

**Frontend:**
```bash
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## ⚙️ Configuration

### Sync Engine
- `SYNC_INTERVAL`: Time between sync cycles (default: 3000ms)
- Auto-retry on API failures (3 attempts)
- Exponential backoff

### Database
- Automatic cleanup of old equity snapshots (30+ days)
- Connection pooling for performance
- SSL support for production

### API
- Rate limiting: 100 requests per 15 minutes
- Timeout: 10 seconds for external API calls
- Automatic retry logic

## 🚨 Troubleshooting

### Backend Not Starting
1. Check all environment variables are set
2. Verify database URL is correct
3. Check logs for errors
4. Ensure dependencies are installed

### WebSocket Connection Issues
1. Verify `FRONTEND_URL` matches frontend URL
2. Check backend logs for WebSocket errors
3. Ensure JWT token is valid
4. Verify both services are running

### Database Connection Issues
1. Verify database URL format
2. Check PostgreSQL is running
3. Ensure database exists
4. Review database logs

### Sync Engine Not Working
1. Verify RoboForex API credentials
2. Check API endpoint accessibility
3. Review sync engine logs
4. Ensure account_id is correct

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## 📈 Performance

- Sync interval: 3 seconds (configurable)
- WebSocket for real-time updates
- Optimized database queries with indexes
- Efficient data caching
- Connection pooling

## 🔐 Security Best Practices

1. **Change default password** - Update admin password immediately
2. **Use strong JWT secret** - Generate a secure random string
3. **Rotate API tokens** - Regularly update RoboForex API token
4. **Monitor access logs** - Watch for suspicious activity
5. **Keep dependencies updated** - Install security patches
6. **Use HTTPS** - All Render services use HTTPS by default

## 📞 Support

For issues:
1. Check documentation in `/docs` folder
2. Review troubleshooting section
3. Check Render status page
4. Review application logs

## 📄 License

This project is for educational and personal use.

## ⚠️ Disclaimer

This software is provided as-is for educational purposes. Trading involves risk, and you should carefully consider your financial decisions before using any trading platform.

## 🔄 Data Flow

```
RoboForex API → Sync Engine → PostgreSQL → REST API → Frontend
                       ↓                   ↓
                    WebSocket ←───────────┘
```

## 🎯 Next Steps

1. Configure RoboForex API credentials
2. Test all features locally
3. Deploy to Render
4. Set up monitoring
5. Configure alerts

## ✨ Project Status

**Version:** 1.0.0  
**Status:** Production Ready  
**License:** Educational/Personal Use

---

Built with ❤️ for the trading community