# IRCAMONEY Architecture Analysis

## Project Overview
IRCAMONEY is a fintech platform designed to mirror live trading data from the RoboForex StocksTrader API. It serves as a portfolio management tool offering real-time monitoring, trade replication, and performance analytics. It is built as a monorepo containing both the server and client applications.

## 1. Backend Architecture
The backend is a robust Node.js application designed to handle high-frequency data synchronization and real-time broadcasting.

- **Framework:** Node.js with Express.js.
- **Database:** PostgreSQL (v13+) using connection pooling.
- **Real-Time Engine:** Socket.IO for WebSocket communication.
- **Authentication:** JWT (JSON Web Tokens) with bcrypt for password hashing.

### Key Components

#### Sync Engine (`services/syncEngine.js`)
- **Function:** Runs a synchronization cycle every 3 seconds.
- **Workflow:**
    1. Fetches Account State, Open Orders, Closed Deals, and Live Quotes (e.g., XAUUSD) from the RoboForex API.
    2. Saves/Updates this data in the PostgreSQL database.
    3. Emits `account_update`, `orders_update`, etc., events via WebSockets to connected clients.
- **Resilience:** Implements auto-retry logic (3 attempts) with exponential backoff for API failures.

#### API Client (`services/robforex.js`)
- A dedicated wrapper for the RoboForex StocksTrader REST API (v0.12.1).
- Handles authentication tokens and request rate limiting.

### Security Layers
- **Rate Limiting:** Limits requests to 100 per 15 minutes to prevent abuse.
- **CORS:** Configured to restrict access to the specific frontend domain.
- **Helmet:** Adds security headers to HTTP responses.

### API Endpoints
- **Auth:** `/api/auth/login`, `/api/auth/register`
- **Data:** `/api/account`, `/api/orders`, `/api/deals`, `/api/equity-history`

## 2. Frontend Architecture
The frontend is a modern Single Page Application (SPA) built for speed and responsiveness.

- **Framework:** React 18 powered by Vite.
- **Styling:** Tailwind CSS for mobile-first responsive design.
- **Visualization:** Recharts for interactive equity curves and financial charts.
- **Icons:** Lucide React.

### Key Pages & Features

#### Dashboard (`/dashboard`)
- Displays live tiles for Balance, Equity, Margin, and Unrealized P/L.
- Shows live price tickers (e.g., XAUUSD).
- Updates instantly via WebSocket events without page reloads.

#### Open Trades (`/trades`)
- Lists active orders with details like Ticker, Side (Buy/Sell), Volume, and Current Price.
- Auto-refreshes status changes.

#### Trade History (`/history`)
- A paginated list of closed deals.
- Includes filtering capabilities and Profit/Loss tracking.

#### Equity Curve (`/equity`)
- Visualizes account performance over time (Hour, Day, Week ranges).
- Uses historical snapshots stored in the database.

### Connectivity
- Uses `socket.io-client` to listen for backend events (`connect`, `disconnect`, `update`).
- Handles connection drops gracefully.

## 3. Data Flow & Infrastructure

### Synchronization Loop
1. **External Source:** RoboForex API provides raw financial data.
2. **Backend Processing:** The Sync Engine normalizes this data and stores it in PostgreSQL tables (`users`, `accounts`, `orders`, `deals`, `quotes`, `equity_snapshots`).
3. **Real-Time Push:** The backend pushes the delta (changes) to the Frontend via WebSockets.
4. **Client Render:** React components receive the payload and update the DOM immediately.

### Deployment (Render)
- **Database:** Managed PostgreSQL instance.
- **Backend Service:** Deployed as a Web Service; environment variables manage API keys and DB connections.
- **Frontend Service:** Deployed as a Static Site/Web Service; communicates with the backend via `VITE_API_URL`.

## Summary of Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 18+ |
| **Frontend** | React, Vite, Tailwind, Recharts |
| **Backend** | Express, Socket.IO, Axios |
| **Database** | PostgreSQL 13+ |
| **DevOps** | Docker, Docker Compose, Render |