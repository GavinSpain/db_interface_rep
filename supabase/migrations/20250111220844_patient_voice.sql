-- Modify the heartbeats table to allow service ID 5
ALTER TABLE heartbeats
DROP CONSTRAINT IF EXISTS heartbeats_service_id_check;

ALTER TABLE heartbeats
ADD CONSTRAINT heartbeats_service_id_check 
CHECK (service_id BETWEEN 1 AND 5);