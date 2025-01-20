/*
  # Remove length check constraints from transactions table

  1. Changes
    - Remove length check constraints from transactions table for:
      - signature
      - token_mint
      - sol_mint
*/

ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS valid_signature,
DROP CONSTRAINT IF EXISTS valid_token_mint,
DROP CONSTRAINT IF EXISTS valid_sol_mint;