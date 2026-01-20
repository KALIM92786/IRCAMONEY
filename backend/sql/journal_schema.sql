-- Add notes column to deals table for Trading Journal
ALTER TABLE deals ADD COLUMN IF NOT EXISTS notes TEXT;