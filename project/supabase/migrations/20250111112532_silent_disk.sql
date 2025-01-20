/*
  # Fix tokens table syntax error

  1. Changes
    - Drop and recreate tokens table with correct syntax
    - Preserve all columns and constraints except length validations
    - Maintain existing indexes and RLS policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS tokens;

-- Recreate tokens table with correct syntax
CREATE TABLE tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint text NOT NULL,
    sol_mint text NOT NULL,
    liquidity_usd numeric(20,2) NOT NULL CHECK (liquidity_usd >= 0),
    volume_24h numeric(20,2) NOT NULL CHECK (volume_24h >= 0),
    price_usd numeric(20,8) NOT NULL CHECK (price_usd >= 0),
    holders integer NOT NULL CHECK (holders >= 0),
    risk_score integer NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    risk_level text NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    is_honeypot boolean NOT NULL,
    is_mintable boolean NOT NULL,
    is_ownership_renounced boolean NOT NULL,
    has_high_concentration boolean NOT NULL,
    is_pump_fun boolean NOT NULL,
    created_at timestamptz NOT NULL,
    signature text NOT NULL UNIQUE
);

-- Recreate indexes
CREATE INDEX idx_tokens_token_mint ON tokens(token_mint);
CREATE INDEX idx_tokens_risk_score ON tokens(risk_score);
CREATE INDEX idx_tokens_created_at ON tokens(created_at);

-- Enable Row Level Security
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Enable read access for all users"
    ON tokens
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert access for all users"
    ON tokens
    FOR INSERT
    TO public
    WITH CHECK (true);