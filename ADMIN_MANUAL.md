# IRCAMONEY Administrator Manual

This guide is intended for system administrators responsible for deploying, configuring, and maintaining the IRCAMONEY platform.

## Table of Contents
1. System Architecture
2. Configuration
3. Deployment
4. User Management
5. Broker Integration
6. Maintenance & Monitoring
7. Security
8. Troubleshooting

## System Architecture

IRCAMONEY consists of three main components:
1. **Frontend**: A responsive React (Vite) application. On Render, this is deployed as a **Web Service**.
2. **Backend**: A Node.js/Express API with a Sync Engine and WebSocket server. On Render, this is deployed as a **Web Service**.
3. **Database**: PostgreSQL for storing user data, trade history, and configuration.

## Configuration

The system is configured via environment variables.

### Backend Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API Server Port | `3000` |
| `DATABASE_URL` | PostgreSQL Connection String | - |
| `JWT_SECRET` | Secret key for auth tokens | - |
| `ROBOFOREX_API_URL` | Broker API Endpoint | `https://api.stockstrader.com` |
| `ROBOFOREX_ACCOUNT_ID`| Default account to sync on startup | - |
| `ROBOFOREX_API_TOKEN` | API token for the default account | - |
| `SYNC_INTERVAL` | Data refresh rate (ms) | `3000` |
| `FRONTEND_URL` | Allowed CORS Origin | - |
| `SMTP_HOST`, `SMTP_PORT`, etc. | Credentials for email service | - |

### Frontend Variables
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL of the Backend API |

## Deployment

The recommended deployment method is using the `render.yaml` blueprint on Render.

1.  Push the code to a GitHub repository.
2.  In the Render Dashboard, select **New > Blueprint Instance**.
3.  Connect your repository. Render will automatically detect `render.yaml` and create the three services (Database, Backend, Frontend).
4.  Manually add secrets (like `ROBOFOREX_API_TOKEN`, `SMTP_PASS`) to the backend's environment variables in the Render dashboard.

Refer to **DEPLOYMENT.md** for a detailed step-by-step guide.

## User Management

### Default Admin
On first startup, the system creates a default admin user:
- **Username**: `admin`
- **Password**: `admin123`

**Security Warning**: Change this password immediately after deployment.

### User Registration
New users can sign up through the registration form on the login page.

### Managing Users (Admin UI)
Admins can navigate to the **User Management** page to:
- View all registered users.
- See user roles (Admin/User).
- Delete non-admin user accounts.

### Profile Management
Users can update their own email and password on the `/profile` page.

## Broker Integration

The system connects to RoboForex StocksTrader API.

### Setup
1.  Obtain an **Account ID** and **API Token** from the RoboForex StocksTrader platform.
2.  Users can add their credentials via the **Settings** page in the UI.
3.  For the initial admin setup, you can set `ROBOFOREX_ACCOUNT_ID` and `ROBOFOREX_API_TOKEN` in the backend's environment variables. These will be automatically migrated to the admin's database record on startup.

### Sync Engine
The `SyncEngine` service runs in the background on the backend server.
- It polls the broker API every `SYNC_INTERVAL`.
- It updates Account Balance, Equity, Orders, and Deals in the database.
- It broadcasts updates to the frontend via WebSockets (`socket.io`).

## Maintenance & Monitoring

### Logs
- **Render Logs**: View real-time logs for both frontend and backend services directly in the Render dashboard.
- **System Logs (UI)**: The backend captures console output and stores it in the `system_logs` table. Admins can view these logs on the **System Logs** page in the UI.
- **Activity Logs (UI)**: Key user actions (like login, settings changes) are recorded in `activity_logs` and can be viewed on the **Activity Log** page.

### Database Cleanup
The `Scheduler` service runs daily to perform automated cleanup:
- Delete `system_logs` older than 7 days.
- Delete `notifications` older than 30 days.

### Database Backups
- **Automated**: The `Scheduler` creates a database backup daily at 2:00 AM. Old backups (older than 7 days) are automatically deleted.
- **Manual Creation**: Admins can trigger a backup immediately from the **Settings** page.
- **Download**: Backups are listed in the Settings page and can be downloaded as `.sql` files for off-site storage or restoration.

## Security

- **Helmet**: Applies basic security headers to protect against common web vulnerabilities.
- **Rate Limiting**: The API is protected against brute-force attacks, limiting IPs to 100 requests per 15 minutes.
- **CORS**: Configured to only allow requests from the specified `FRONTEND_URL`.
- **Authentication**: Uses JWT with secure password hashing (bcrypt).

## Troubleshooting

### Common Issues

**1. "Connection Refused" on Database**
- Verify `DATABASE_URL` is correct.
- Ensure PostgreSQL service is running and accepts connections.
- Check SSL settings in `backend/config/database.js` (required for Render).

**2. No Data in Dashboard**
- **Check Credential Diagnostic**: On server startup, the backend runs a diagnostic check on the RoboForex credentials. Review the startup logs for "--- CREDENTIAL DIAGNOSTIC START ---". It will tell you if the token is valid and if the account ID matches.
- Check Backend Logs for API errors or sync failures.
- Verify RoboForex API Token validity.
- Ensure the `SyncEngine` is running (look for "Starting sync engine" in logs).
- Use the "Fetch Accounts from Broker" button in Settings to ensure accounts are in the database.

**3. WebSocket Connection Failed**
- Ensure Frontend `VITE_API_URL` points correctly to the Backend.
- Verify the `FRONTEND_URL` environment variable on the backend is correct.

**4. API Rate Limits**
- If logs show 429 errors from RoboForex, increase `SYNC_INTERVAL` in environment variables.