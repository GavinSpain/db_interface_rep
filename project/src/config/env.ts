import { defaults } from './defaults';

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || defaults.supabase.url,
    key: process.env.SUPABASE_KEY || defaults.supabase.key
  },
  ports: {
    internal: process.env.INTERNAL_PORT || 3001,
    external: process.env.EXTERNAL_PORT || 443
  },
  ssl: {
    key: '/etc/ssl/key.pem',
    cert: '/etc/ssl/cert.pem'
  },
  heartbeat: {
    serviceId: parseInt(process.env.HEARTBEAT_SERVICE_ID || '3', 10),
    intervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '10000', 10)
  }
};