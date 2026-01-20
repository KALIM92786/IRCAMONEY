-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY DEFAULT CAST(uuid_generate_v4() AS VARCHAR), -- RoboForex Account ID
    user_id UUID REFERENCES users(id),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    equity DECIMAL(15, 2) NOT NULL DEFAULT 0,
    margin DECIMAL(15, 2) NOT NULL DEFAULT 0,
    free_margin DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    leverage INTEGER DEFAULT 100,
    type VARCHAR(50),
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table (Open Positions)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- Ticket ID
    account_id VARCHAR(50) REFERENCES accounts(id),
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL, -- BUY/SELL
    volume DECIMAL(10, 2) NOT NULL,
    open_price DECIMAL(15, 5) NOT NULL,
    current_price DECIMAL(15, 5),
    sl DECIMAL(15, 5),
    tp DECIMAL(15, 5),
    swap DECIMAL(10, 2) DEFAULT 0,
    commission DECIMAL(10, 2) DEFAULT 0,
    profit DECIMAL(15, 2) DEFAULT 0,
    open_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Deals Table (History)
CREATE TABLE IF NOT EXISTS deals (
    id VARCHAR(50) PRIMARY KEY, -- Deal ID
    order_id VARCHAR(50), -- Original Ticket
    account_id VARCHAR(50) REFERENCES accounts(id),
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL, -- BUY/SELL
    volume DECIMAL(10, 2) NOT NULL,
    open_price DECIMAL(15, 5),
    close_price DECIMAL(15, 5),
    close_time TIMESTAMP WITH TIME ZONE,
    profit DECIMAL(15, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0,
    swap DECIMAL(10, 2) DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equity Snapshots (For Charts)
CREATE TABLE IF NOT EXISTS equity_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(50) REFERENCES accounts(id),
    equity DECIMAL(15, 2) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL,
    margin DECIMAL(15, 2) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- INFO, ERROR, WARN
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Broker Connections (API Tokens)
CREATE TABLE IF NOT EXISTS broker_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    broker_name VARCHAR(50) DEFAULT 'RoboForex',
    account_id VARCHAR(50) NOT NULL,
    api_token VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, account_id)
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quotes Table (Live Prices)
CREATE TABLE IF NOT EXISTS quotes (
    symbol VARCHAR(20) PRIMARY KEY,
    bid DECIMAL(15, 5) NOT NULL,
    ask DECIMAL(15, 5) NOT NULL,
    spread DECIMAL(10, 1),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to prevent NULL ID crashes
CREATE OR REPLACE FUNCTION set_default_account_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL THEN
        NEW.id := CAST(uuid_generate_v4() AS VARCHAR);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_account_id ON accounts;
CREATE TRIGGER ensure_account_id
BEFORE INSERT ON accounts
FOR EACH ROW
EXECUTE FUNCTION set_default_account_id();