import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { Transaction } from '../types/transaction';

export class TransactionController {
  private service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  store = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body.transactions || !Array.isArray(req.body.transactions)) {
        res.status(400).json({
          error: 'Invalid request format',
          message: 'Request body must contain a "transactions" array'
        });
        return;
      }

      // Extract all fields from each transaction
      const simplifiedTransactions = req.body.transactions.map((tx: any): Transaction => ({
        signature: tx.signature,
        tokenMint: tx.tokenMint,
        solMint: tx.solMint,
        timestamp: tx.timestamp,
        liquidity_usd: tx.liquidity_usd,
        volume_24h: tx.volume_24h,
        price_usd: tx.price_usd,
        holders: tx.holders,
        risk_score: tx.risk_score,
        risk_level: tx.risk_level,
        is_honeypot: tx.is_honeypot,
        is_mintable: tx.is_mintable,
        is_ownership_renounced: tx.is_ownership_renounced,
        has_high_concentration: tx.has_high_concentration,
        is_pump_fun: tx.is_pump_fun
      }));

      const results = await this.service.createTransactions(simplifiedTransactions);
      res.status(201).json(results);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
        return;
      }
      logger.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  index = async (_req: Request, res: Response): Promise<void> => {
    try {
      const transactions = await this.service.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      logger.error('Error retrieving transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}