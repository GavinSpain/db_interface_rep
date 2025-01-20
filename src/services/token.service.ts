import { Token } from '../types/token';
import { TokenRepository } from '../repositories/token.repository';
import { logger } from '../utils/logger';
import { z } from 'zod';

const tokenSchema = z.object({
  token_mint: z.string(),
  sol_mint: z.string(),
  liquidity_usd: z.number().nonnegative(),
  volume_24h: z.number().nonnegative(),
  price_usd: z.number().nonnegative(),
  holders: z.number().int().nonnegative(),
  risk_score: z.number().int().min(0).max(100),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']),
  is_honeypot: z.boolean(),
  is_mintable: z.boolean(),
  is_ownership_renounced: z.boolean(),
  has_high_concentration: z.boolean(),
  is_pump_fun: z.boolean(),
  signature: z.string()
});

export class TokenService {
  private repository: TokenRepository;

  constructor() {
    this.repository = new TokenRepository();
  }

  async createToken(token: Token): Promise<Token> {
    logger.debug('Creating token:', token);
    const validatedToken = tokenSchema.parse(token);
    return await this.repository.create({
      ...validatedToken,
      created_at: new Date().toISOString()
    });
  }

  async getAllTokens(): Promise<Token[]> {
    return await this.repository.findAll();
  }

  async getTokenBySignature(signature: string): Promise<Token | null> {
    return await this.repository.findBySignature(signature);
  }
}