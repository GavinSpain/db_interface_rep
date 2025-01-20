/*
  # Add unique constraint to transactions table

  1. Changes
    - Add unique constraint to signature column in transactions table
    - This ensures each transaction signature can only appear once in the table
    - Matches the upsert functionality in the repository that uses signature as the conflict key

  2. Security
    - No changes to RLS policies
*/

-- Add unique constraint to signature
ALTER TABLE transactions
ADD CONSTRAINT transactions_signature_key UNIQUE (signature);