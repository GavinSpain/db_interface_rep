import { createClient } from '@supabase/supabase-js';
import { config } from './env';
import fetch from 'cross-fetch';
import { logger } from '../utils/logger';

// Create a single instance of the Supabase client
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.key;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

logger.debug('Initializing Supabase client', { url: supabaseUrl });

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Since we're running in a server environment
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    fetch: fetch, // Use cross-fetch implementation
    headers: {
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  }
});

// Test the connection
void (async () => {
  try {
    const { data, error } = await supabase.from('heartbeats').select('count');
    if (error) throw error;
    logger.success('Supabase connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to Supabase:', error);
  }
})();