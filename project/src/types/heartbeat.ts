export interface Heartbeat {
  id?: string;
  service_id: number;
  last_heartbeat: string;
  created_at?: string;
}

export interface HeartbeatResponse {
  service_id?: number;
  seconds_since_last: number;
}

export interface AllHeartbeatsResponse {
  heartbeats: HeartbeatResponse[];
}