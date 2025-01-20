import { Request, Response } from 'express';
import { HeartbeatService } from '../services/heartbeat.service';
import { logger } from '../utils/logger';

export class HeartbeatStatusController {
  private service: HeartbeatService;

  constructor() {
    this.service = new HeartbeatService();
  }

  getStatus = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getTimeSinceLastHeartbeat(0);
      res.json(result);
    } catch (error) {
      logger.error('Error getting heartbeat status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}