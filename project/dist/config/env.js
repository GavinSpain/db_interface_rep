"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const defaults_1 = require("./defaults");
exports.config = {
    supabase: {
        url: process.env.SUPABASE_URL || defaults_1.defaults.supabase.url,
        key: process.env.SUPABASE_KEY || defaults_1.defaults.supabase.key
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