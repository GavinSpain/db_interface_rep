/*
  # Create heartbeats table

  1. New Tables
    - `heartbeats`
      - `id` (uuid, primary key)
      - `service_id` (integer)
      - `last_heartbeat` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `heartbeats` table
    - Add policies for public access
*/

CREATE TABLE heartbeats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id integer NOT NULL,
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