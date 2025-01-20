import { Request, Response } from 'express';
import { TokenService } from '../services/token.service';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class TokenController {
  private service: TokenService;

  constructor() {
    this.service = new TokenService();
  }

  store = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.debug('Received token data:', req.body);
      const token = await this.service.createToken(req.body);
      res.status(201).json(token);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
        return;
      }
      logger.error('Error processing token request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  index = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tokens = await this.service.getAllTokens();
      res.json(tokens);
    } catch (error) {
      logger.error('Error retrieving tokens:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  show = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = await this.service.getTokenBySignature(req.params.signature);
      if (!token) {
        res.status(404).json({ error: 'Token not found' });
        return;
      }
      res.json(token);
    } catch (error) {
      logger.error('Error retrieving token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}