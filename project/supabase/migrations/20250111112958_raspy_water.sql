/*
  # Simplify schema to single transactions table

  1. Changes
    - Drop tokens table
    - Update transactions table to include all fields
    - Update RLS policies
*/

-- Drop tokens table
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS risk_analysis;

-- Modify transactions table to include all fields
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS liquidity_usd numeric(20,2) DEFAULT 0 CHECK (liquidity_usd >= 0),
ADD COLUMN IF NOT EXISTS volume_24h numeric(20,2) DEFAULT 0 CHECK (volume_24h >= 0),
ADD COLUMN IF NOT EXISTS price_usd numeric(20,8) DEFAULT 0 CHECK (price_usd >= 0),
ADD COLUMN IF NOT EXISTS holders integer DEFAULT 0 CHECK (holders >= 0),
ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
ADD COLUMN IF NOT EXISTS is_honeypot boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_mintable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_ownership_renounced boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_high_concentration boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pump_fun boolean DEFAULT false;