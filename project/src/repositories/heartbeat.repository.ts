import { supabase } from '../config/supabase';
import { Heartbeat } from '../types/heartbeat';
import { logger } from '../utils/logger';

export class HeartbeatRepository {
  async upsert(serviceId: number, timestamp: string): Promise<Heartbeat> {
    try {
      logger.debug('Upserting heartbeat', { serviceId, timestamp });
      
      const { data, error } = await supabase
        .from('heartbeats')
        .upsert(
          {
            service_id: serviceId,
            last_heartbeat: timestamp
          },
          {
            onConflict: 'service_id'
          }
        )
        .select()
        .single();

      if (error) {
        logger.error('Error upserting heartbeat:', error);
        throw new Error(`Heartbeat upsert error: ${error.message}`);
      }

      logger.debug('Heartbeat upserted successfully', { data });
      return data;
    } catch (error) {
      logger.error('Repository operation failed:', error);
      throw error;
    }
  }

  async getLastHeartbeat(serviceId: number): Promise<Heartbeat | null> {
    try {
      const { data, error } = await supabase
        .from('heartbeats')
        .select('*')
        .eq('service_id', serviceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching heartbeat:', error);
        throw new Error(`Query error: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Repository operation failed:', error);
      throw error;
    }
  }

  async findAll(): Promise<Heartbeat[]> {
    try {
      const { data, error } = await supabase
        .from('heartbeats')
        .select('*')
        .order('service_id', { ascending: true });

      if (error) {
        logger.error('Error fetching all heartbeats:', error);
        throw new Error(`Query error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Repository operation failed:', error);
      throw error;
    }
  }
}