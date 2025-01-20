/*
  # Remove length constraints from transactions and tokens tables

  1. Changes
    - Remove length validation constraints from transactions table
      - Remove CHECK constraint for signature length
      - Remove CHECK constraint for token_mint length
      - Remove CHECK constraint for sol_mint length
    - Remove length validation constraints from tokens table
      - Remove CHECK constraint for token_mint length
      - Remove CHECK constraint for sol_mint length

  2. Security
    - No changes to RLS policies
    - Existing security measures remain intact
*/

-- Remove constraints from transactions table
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS valid_signature,
DROP CONSTRAINT IF EXISTS valid_token_mint,
DROP CONSTRAINT IF EXISTS valid_sol_mint;

-- Remove constraints from tokens table
ALTER TABLE tokens
DROP CONSTRAINT IF EXISTS valid_token_mint,
DROP CONSTRAINT IF EXISTS valid_sol_mint;