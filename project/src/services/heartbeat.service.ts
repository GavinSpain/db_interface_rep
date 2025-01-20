import { Heartbeat, HeartbeatResponse, AllHeartbeatsResponse } from '../types/heartbeat';
import { HeartbeatRepository } from '../repositories/heartbeat.repository';
import { z } from 'zod';
import { logger } from '../utils/logger';

const heartbeatSchema = z.object({
  service_id: z.number().int().min(1).max(5),
  timestamp: z.string().datetime()
});

export class HeartbeatService {
  private repository: HeartbeatRepository;
  private readonly STALE_THRESHOLD_MS = 30000; // 30 seconds

  constructor() {
    this.repository = new HeartbeatRepository();
  }

  async updateHeartbeat(serviceId: number, timestamp: string): Promise<Heartbeat> {
    try {
      const validated = heartbeatSchema.parse({ service_id: serviceId, timestamp });
      logger.debug('Updating heartbeat', validated);
      return await this.repository.upsert(validated.service_id, validated.timestamp);
    } catch (error) {
      logger.error('Heartbeat update failed:', error);
      throw error;
    }
  }

  async getTimeSinceLastHeartbeat(serviceId: number): Promise<HeartbeatResponse | AllHeartbeatsResponse> {
    try {
      if (serviceId === 0) {
        const allHeartbeats = await this.repository.findAll();
        const heartbeats = allHeartbeats.map(heartbeat => {
          const seconds = this.calculateSecondsSince(heartbeat.last_heartbeat);
          
          if (this.isHeartbeatStale(heartbeat.last_heartbeat)) {
            return {
              service_id: heartbeat.service_id,
              seconds_since_last: -1
            };
          }

          return {
            service_id: heartbeat.service_id,
            seconds_since_last: seconds
          };
        });
        return { heartbeats };
      }

      const validated = heartbeatSchema.shape.service_id.parse(serviceId);
      const heartbeat = await this.repository.getLastHeartbeat(validated);

      if (!heartbeat) {
        return { seconds_since_last: -1 };
      }

      if (this.isHeartbeatStale(heartbeat.last_heartbeat)) {
        return { seconds_since_last: -1 };
      }

      const seconds = this.calculateSecondsSince(heartbeat.last_heartbeat);
      return { 
        service_id: serviceId,
        seconds_since_last: seconds
      };
    } catch (error) {
      logger.error('Error getting heartbeat time:', error);
      throw error;
    }
  }

  private calculateSecondsSince(timestamp: string): number {
    const lastHeartbeat = new Date(timestamp);
    const now = new Date();
    
    if (lastHeartbeat > now) {
      return 0;
    }
    
    const seconds = Math.floor((now.getTime() - lastHeartbeat.getTime()) / 1000);
    return Math.max(0, seconds);
  }

  private isHeartbeatStale(timestamp: string): boolean {
    const lastHeartbeat = new Date(timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - lastHeartbeat.getTime();
    return timeDiff > this.STALE_THRESHOLD_MS;
  }
}