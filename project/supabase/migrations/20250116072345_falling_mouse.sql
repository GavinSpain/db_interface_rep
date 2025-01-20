/*
  # Add unique constraint to heartbeats table

  1. Changes
    - Add unique constraint on service_id column in heartbeats table
    - This ensures each service can only have one heartbeat record
    - Required for upsert operations using ON CONFLICT

  2. Impact
    - Prevents duplicate service_id entries
    - Enables proper upsert functionality
*/

-- Add unique constraint to service_id
ALTER TABLE heartbeats
ADD CONSTRAINT heartbeats_service_id_key UNIQUE (service_id);