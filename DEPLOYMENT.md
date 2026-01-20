# IRCAMONEY - Render Deployment Guide

Complete guide for deploying IRCAMONEY to Render.com using automated Blueprint.

## 🚀 Quick Deploy (Recommended)

### Prerequisites
- GitHub account with project pushed
- Render.com account (free tier)
- RoboForex API credentials

### Step 1: Push to GitHub

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Select the `IRCAMONEY` repository
5. Render will detect `render.yaml` automatically
6. Review the configuration:
   - Backend web service
   - Frontend web service  
   - PostgreSQL database
7. Click **Apply Blueprint**

### Step 3: Configure RoboForex Credentials

1. Go to your backend service on Render
2. Click **Environment** tab
3. Add the following environment variables:
   ```
   ROBOFOREX_ACCOUNT_ID=your_actual_account_id
   ROBOFOREX_API_TOKEN=your_actual_api_token
   ```
4. Click **Save Changes** (this triggers a redeploy)

### Step 4: Access Your Application

After deployment completes:
- Frontend: `https://ircamoney-frontend.onrender.com`
- Backend: `https://ircamoney-backend.onrender.com`
- Health Check: `https://ircamoney-backend.onrender.com/health`

Login with: `admin` / `admin123`

## 📋 Manual Deployment

If you prefer manual deployment instead of Blueprint:

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - Name: `ircamoneydb`
   - Database: `ircamoneydb`
   - User: `ircamoneydb`
   - Region: Closest to you
   - Plan: Free
4. Click **Create Database**
5. Wait for database to be ready

### Step 2: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Configure:
   - Name: `ircamoney-backend`
   - Runtime: `Node`
   - Root Directory: `backend`
   - Branch: `main`
   - Plan: Free

4. **Build & Deploy Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[Your Internal Database URL]
   JWT_SECRET=[Generate a secure string]
   ROBOFOREX_API_URL=https://api.stockstrader.com
   ROBOFOREX_ACCOUNT_ID=your_account_id
   ROBOFOREX_API_TOKEN=your_api_token
   SYNC_INTERVAL=3000
   FRONTEND_URL=https://ircamoney-frontend.onrender.com
   ```

6. Click **Create Web Service**

### Step 3: Deploy Frontend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Configure:
   - Name: `ircamoney-frontend`
   - Runtime: `Node`
   - Root Directory: `frontend`
   - Branch: `main`
   - Plan: Free

4. **Build & Deploy Settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

5. **Environment Variables:**
   ```
   VITE_API_URL=https://ircamoney-backend.onrender.com
   ```

6. Click **Create Web Service**

### Step 4: Update Backend CORS

1. Go to backend service → **Environment**
2. Update `FRONTEND_URL` if needed
3. Save changes

## 🔧 Database Initialization

After database is created, you need to initialize it:

### Option 1: Use Render Dashboard

1. Go to your PostgreSQL database on Render
2. Click **Connect** → **External Connection**
3. Note the connection string
4. Connect locally:
   ```bash
   psql "postgresql://user:pass@host:port/database" < backend/sql/schema.sql
   ```

### Option 2: Use Database Query Tool

1. Go to your PostgreSQL database on Render
2. Click **Query**
3. Copy contents of `backend/sql/schema.sql`
4. Paste and run the query

### Option 3: Using Render Shell

1. Go to backend service on Render
2. Click **Shell**
3. Run:
   ```bash
   npm run db:reset
   npm run seed
   ```

## ✅ Verify Deployment

### Check Backend Health

Visit: `https://ircamoney-backend.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Frontend

1. Visit: `https://ircamoney-frontend.onrender.com`
2. Login with: `admin` / `admin123`
3. Navigate to Dashboard
4. Check browser console for WebSocket connection

### Monitor Logs

1. Go to backend service → **Logs**
2. Look for:
   - "Database connection established"
   - "IRCAMONEY server running on port 3000"
   - "Starting sync engine"
   - "Sync cycle completed"

## 🚨 Troubleshooting

### Backend Not Starting

**Problem:** Service fails to start

**Solutions:**
1. Check logs for specific error messages
2. Verify all environment variables are set
3. Ensure database URL is correct format
4. Check build logs for dependency issues
5. Verify Node.js version (18+)

### Frontend "Something went wrong"

**Problem:** Generic error page

**Solutions:**
1. Check `VITE_API_URL` is set correctly
2. Verify backend is accessible (test `/health`)
3. Check browser console for errors
4. Ensure build completed successfully

### WebSocket Connection Fails

**Problem:** Real-time updates not working

**Solutions:**
1. Verify `FRONTEND_URL` matches actual frontend URL
2. Check backend logs for WebSocket errors
3. Ensure JWT token is valid (try logout/login)
4. Verify both services are running

### Database Connection Issues

**Problem:** Can't connect to PostgreSQL

**Solutions:**
1. Verify database URL is correct
2. Check database service is running
3. Ensure SSL is properly configured
4. Review database logs
5. Check connection limits

### Sync Engine Not Working

**Problem:** No data being synced

**Solutions:**
1. Verify RoboForex API credentials
2. Check API endpoint is accessible
3. Review sync engine logs
4. Ensure account_id is correct
5. Check for rate limit errors

### Frontend Blocked Request

**Problem:** "This host is not allowed" error

**Solutions:**
1. Ensure `vite.config.js` has `allowedHosts: true`
2. Check Render service is running
3. Verify domain name is correct

### After Database Reset

**Problem:** Authentication errors after database reset

**Solutions:**
1. Log out from the application
2. Log in again to get new token
3. User IDs change after reset

## 📊 Monitoring

### Backend Monitoring

1. Go to backend service → **Metrics**
2. Monitor:
   - CPU usage
   - Memory usage
   - Response time
   - Error rate

### Database Monitoring

1. Go to PostgreSQL database → **Metrics**
2. Monitor:
   - Connection count
   - Storage usage
   - Query performance
   - CPU usage

### Log Monitoring

1. Go to service → **Logs**
2. Set up alerts for:
   - Error messages
   - Sync failures
   - Database errors
   - High response times

## 🔒 Security

### Environment Variables

1. Never commit `.env` files
2. Use Render's secret generation for JWT
3. Rotate API tokens regularly
4. Update default admin password

### SSL/HTTPS

- All Render services use HTTPS automatically
- PostgreSQL uses SSL by default
- No additional configuration needed

### Access Control

1. Change default admin password
2. Use strong JWT secrets
3. Monitor access logs
4. Set up alert notifications

## 📈 Performance Optimization

### Free Tier Limitations

**PostgreSQL Free Tier:**
- 90 days free, then $7/month
- 512 MB RAM
- 1 GB storage

**Web Service Free Tier:**
- 512 MB RAM
- 0.1 CPU
- Spin down after 15 minutes inactivity
- Cold start on new requests

### Optimization Tips

1. **Increase SYNC_INTERVAL** to reduce API calls
2. **Use connection pooling** (already configured)
3. **Optimize database queries** (indexes added)
4. **Enable caching** for static data
5. **Monitor resource usage** regularly

### Scaling

If you exceed free tier limits:
1. Upgrade PostgreSQL plan
2. Upgrade Web Services
3. Add more services (workers)
4. Implement Redis for caching
5. Use CDN for static assets

## 🔄 Updates and Maintenance

### Updating Application

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main

# Render auto-deploys on push
```

### Database Maintenance

```sql
-- Clean up old equity snapshots (older than 30 days)
DELETE FROM equity_snapshots 
WHERE timestamp < NOW() - INTERVAL '30 days';

-- Clean up old deals (older than 90 days)
DELETE FROM deals 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up old orders (older than 90 days)
DELETE FROM orders 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Regular Tasks

1. **Monitor logs** - Check daily for errors
2. **Review database** - Clean up old data
3. **Update dependencies** - Keep packages current
4. **Check API quotas** - Monitor RoboForex usage
5. **Test backups** - Verify backup system

## 📞 Support

### Documentation
- [Render Docs](https://render.com/docs)
- [RoboForex API](https://api.stockstrader.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Getting Help
1. Check application logs
2. Review Render status page
3. Check community forums
4. Contact Render support

## 🎯 Next Steps

1. ✅ Deploy using Blueprint
2. ✅ Configure RoboForex credentials
3. ✅ Test all features
4. ✅ Set up monitoring alerts
5. ✅ Configure error tracking (Sentry, etc.)
6. ✅ Set up automated backups
7. ✅ Implement CI/CD pipeline
8. ✅ Add performance monitoring

## 📝 Checklist

Before going live:
- [ ] RoboForex API credentials configured
- [ ] Database initialized with schema
- [ ] Default admin password changed
- [ ] Health check endpoint working
- [ ] WebSocket connection verified
- [ ] All pages loading correctly
- [ ] Mobile responsiveness tested
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

**Deployed Successfully!** Your IRCAMONEY platform is now live on Render. 🎉