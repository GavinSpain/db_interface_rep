/*
  # Initial Schema Setup for Transaction Service

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `signature` (text, unique, 88 chars)
      - `token_mint` (text, 44 chars)
      - `sol_mint` (text, 44 chars)
      - `timestamp` (bigint)
      - `created_at` (timestamptz)

    - `risk_analysis`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, foreign key)
      - `single_holder_ownership` (numeric)
      - `low_liquidity` (numeric)
      - `has_disallowed_risks` (boolean)
      - `liquidity` (numeric)
      - `volume_24h` (numeric)
      - `price` (numeric)
      - `holders` (integer)
      - `created_at` (timestamptz)

  2. Indexes
    - Transactions: signature, token_mint, timestamp
    - Risk Analysis: transaction_id

  3. Security
    - Enable RLS on both tables
    - Full access policies (SELECT, INSERT, UPDATE, DELETE)
*/

-- Create transactions table
CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    signature text NOT NULL,
    token_mint text NOT NULL,
    sol_mint text NOT NULL,
    timestamp bigint NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_signature CHECK (length(signature) = 88),
    CONSTRAINT valid_token_mint CHECK (length(token_mint) = 44),
    CONSTRAINT valid_sol_mint CHECK (length(sol_mint) = 44),
    CONSTRAINT signature_unique UNIQUE (signature)
);

-- Create risk_analysis table
CREATE TABLE risk_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
    single_holder_ownership numeric(5,2) CHECK (single_holder_ownership BETWEEN 0 AND 100),
    low_liquidity numeric(20,2) CHECK (low_liquidity >= 0),
    has_disallowed_risks boolean NOT NULL,
    liquidity numeric(20,2) CHECK (liquidity >= 0),
    volume_24h numeric(20,2) CHECK (volume_24h >= 0),
    price numeric(20,8) CHECK (price >= 0),
    holders integer CHECK (holders >= 0),
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_transactions_signature ON transactions(signature);
CREATE INDEX idx_transactions_token_mint ON transactions(token_mint);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_risk_analysis_transaction_id ON risk_analysis(transaction_id);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Enable full access for transactions"
    ON transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for risk_analysis
CREATE POLICY "Enable full access for risk_analysis"
    ON risk_analysis
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);