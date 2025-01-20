import { TransactionService } from '../transaction.service';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { ZodError } from 'zod';

// Mock the TransactionRepository
jest.mock('../../repositories/transaction.repository');

describe('TransactionService', () => {
  let service: TransactionService;
  
  const validTransaction = {
    signature: "GvN4or77m8ih1Qv4QTHubnQRi4KLsamNqFp6B8GvZw1zzj6HqSSqR1yckxkmDs454NUKmWpLycXfoj7hW4jDAKP",
    tokenMint: "3HDtQKLxSQCsUpVLC53A6rE987LhqsbySDJHKfBorvLM",
    solMint: "So11111111111111111111111111111111111111112",
    timestamp: 1736158252832,
    liquidity_usd: 50000.00,
    volume_24h: 25000.00,
    price_usd: 0.15,
    holders: 1500,
    risk_score: 50,
    risk_level: 'MEDIUM' as const,
    is_honeypot: false,
    is_mintable: true,
    is_ownership_renounced: false,
    has_high_concentration: true,
    is_pump_fun: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionService();
  });

  describe('createTransactions', () => {
    it('should create transactions successfully', async () => {
      const expectedResult = [{ 
        ...validTransaction,
        id: 'uuid-1',
        created_at: new Date().toISOString()
      }];
      
      (TransactionRepository.prototype.upsert as jest.Mock).mockResolvedValue(expectedResult[0]);

      const result = await service.createTransactions([validTransaction]);
      
      expect(result).toEqual(expectedResult);
      expect(TransactionRepository.prototype.upsert).toHaveBeenCalledWith(validTransaction);
    });

    it('should validate transaction data before creation', async () => {
      const invalidTransaction = {
        ...validTransaction,
        tokenMint: 'invalid'
      };
      
      await expect(service.createTransactions([invalidTransaction]))
        .rejects
        .toThrow(ZodError);
      
      expect(TransactionRepository.prototype.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getAllTransactions', () => {
    it('should retrieve all transactions', async () => {
      const expectedTransactions = [
        { 
          ...validTransaction,
          id: 'uuid-1',
          created_at: new Date().toISOString()
        }
      ];
      
      (TransactionRepository.prototype.findAll as jest.Mock).mockResolvedValue(expectedTransactions);

      const result = await service.getAllTransactions();
      
      expect(result).toEqual(expectedTransactions);
      expect(TransactionRepository.prototype.findAll).toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      (TransactionRepository.prototype.findAll as jest.Mock).mockRejectedValue(error);

      await expect(service.getAllTransactions())
        .rejects
        .toThrow('Database error');
    });
  });
});