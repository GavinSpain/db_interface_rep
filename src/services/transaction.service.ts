import { Transaction, TransactionRecord } from '../types/transaction';
import { TransactionRepository } from '../repositories/transaction.repository';
import { transactionSchema } from '../schemas/transaction.schema';
import { logger } from '../utils/logger';
import { z } from 'zod';

export class TransactionService {
  private repository: TransactionRepository;

  constructor() {
    this.repository = new TransactionRepository();
  }

  async createTransactions(transactions: Transaction[]): Promise<TransactionRecord[]> {
    logger.info('Processing transactions:', transactions);
    
    // Validate all transactions first
    const transactionArraySchema = z.array(transactionSchema);
    const validatedTransactions = transactionArraySchema.parse(transactions);
    
    // Process all transactions
    const results = await Promise.all(
      validatedTransactions.map(transaction => this.repository.upsert(transaction))
    );
    
    return results;
  }

  async getAllTransactions(): Promise<TransactionRecord[]> {
    return await this.repository.findAll();
  }
}