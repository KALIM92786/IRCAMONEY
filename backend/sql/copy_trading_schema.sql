-- Copy Trading Settings Table
CREATE TABLE IF NOT EXISTS copy_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    master_account_id VARCHAR(50) NOT NULL,
    slave_account_id VARCHAR(50) NOT NULL,
    multiplier DECIMAL(5, 2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Copied Trades Tracking Table
CREATE TABLE IF NOT EXISTS copied_trades (
    id SERIAL PRIMARY KEY,
    setting_user_id UUID REFERENCES users(id),
    master_order_id VARCHAR(50) NOT NULL,
    slave_order_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);