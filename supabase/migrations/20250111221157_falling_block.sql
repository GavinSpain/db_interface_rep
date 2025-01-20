/*
  # Create heartbeats table for service monitoring

  1. New Tables
    - `heartbeats`
      - `id` (uuid, primary key)
      - `service_id` (integer, 1-5)
      - `last_heartbeat` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `heartbeats` table
    - Add policies for public read and write access
*/

CREATE TABLE IF NOT EXISTS heartbeats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id integer NOT NULL CHECK (service_id BETWEEN 1 AND 5),
    last_heartbeat timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_heartbeats_service_id ON heartbeats(service_id);

-- Enable Row Level Security
ALTER TABLE heartbeats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
    ON heartbeats
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert/update access for all users"
    ON heartbeats
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);