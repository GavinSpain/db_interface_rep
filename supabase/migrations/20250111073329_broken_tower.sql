/*
  # Create tokens table

  1. New Table
    - `tokens`
      - `id` (uuid, primary key)
      - `token_mint` (text)
      - `sol_mint` (text)
      - `liquidity_usd` (numeric)
      - `volume_24h` (numeric)
      - `price_usd` (numeric)
      - `holders` (integer)
      - `risk_score` (integer)
      - `risk_level` (text)
      - `is_honeypot` (boolean)
      - `is_mintable` (boolean)
      - `is_ownership_renounced` (boolean)
      - `has_high_concentration` (boolean)
      - `is_pump_fun` (boolean)
      - `created_at` (timestamptz)
      - `signature` (text)

  2. Security
    - Enable RLS on `tokens` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS tokens (
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
    signature text NOT NULL UNIQUE,
);

-- Create indexes
CREATE INDEX idx_tokens_token_mint ON tokens(token_mint);
CREATE INDEX idx_tokens_risk_score ON tokens(risk_score);
CREATE INDEX idx_tokens_created_at ON tokens(created_at);

-- Enable Row Level Security
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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