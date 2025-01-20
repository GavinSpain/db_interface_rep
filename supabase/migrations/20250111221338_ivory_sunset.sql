/*
  # Create heartbeats table for service monitoring

  Creates a simple heartbeats table for tracking service status
*/

CREATE TABLE IF NOT EXISTS heartbeats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id integer NOT NULL,
    last_heartbeat timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

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