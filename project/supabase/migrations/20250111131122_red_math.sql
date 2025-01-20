/*
  # Add UNKNOWN to risk_level options

  1. Changes
    - Modify CHECK constraint on transactions.risk_level to include 'UNKNOWN' as a valid value

  2. Security
    - No changes to RLS policies
*/

ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_risk_level_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_risk_level_check 
CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'));