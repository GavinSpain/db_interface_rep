"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const logger_1 = require("../utils/logger");
// Create a single instance of the Supabase client
const supabaseUrl = env_1.config.supabase.url;
const supabaseKey = env_1.config.supabase.key;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Please check your environment variables.');
}
logger_1.logger.debug('Initializing Supabase client', { url: supabaseUrl });
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false // Since we're running in a server environment
    },
    global: {
        fetch: cross_fetch_1.default // Use cross-fetch implementation
    }
});
// Test the connection
void (async () => {
    try {
        await exports.supabase.from('heartbeats').select('count');
        logger_1.logger.success('Supabase connection established successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to Supabase:', error);
    }
})();
