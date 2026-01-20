-- Add margin_level column to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS margin_level DECIMAL(10, 2) DEFAULT 0;