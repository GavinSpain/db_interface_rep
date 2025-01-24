import { Request, Response } from 'express';
import { HeartbeatService } from '../services/heartbeat.service';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class HeartbeatController {
  private service: HeartbeatService;

  constructor() {
    this.service = new HeartbeatService();
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const serviceId = parseInt(req.params.serviceId, 10);
      const timestamp = new Date().toISOString();
      const result = await this.service.updateHeartbeat(serviceId, timestamp);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
        return;
      }
      logger.error('Error updating heartbeat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTimeSince = async (req: Request, res: Response): Promise<void> => {
    try {
      const serviceId = req.params.serviceId ? parseInt(req.params.serviceId, 10) : 0;
      const result = await this.service.getTimeSinceLastHeartbeat(serviceId);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
        return;
      }
      logger.error('Error getting heartbeat time:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public getHeartbeatStatus = (req: Request, res: Response): void => {
    const heartbeatData = [];
    
    for (let i = 1; i <= 5; i++) {
        heartbeatData.push({ 
            service_id: i,
            seconds_since_last: Math.floor(Math.random() * 30)
        });
    }
    
    res.json({ heartbeats: heartbeatData });
  }
}