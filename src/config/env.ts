import { defaults } from './defaults';

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || defaults.supabase.url,
    key: process.env.SUPABASE_KEY || defaults.supabase.key
  },
  ports: {
    internal: process.env.INTERNAL_PORT || defaults.ports.internal,
    external: process.env.EXTERNAL_PORT || defaults.ports.external
  },
  ssl: {
    key: process.env.SSL_KEY_PATH || '/etc/ssl/key.pem',
    cert: process.env.SSL_CERT_PATH || '/etc/ssl/cert.pem'
  },
  heartbeat: {
    serviceId: parseInt(process.env.HEARTBEAT_SERVICE_ID || '3', 10),
    intervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '10000', 10)
  }
};