import { z } from 'zod';

export const transactionSchema = z.object({
  signature: z.string(),
  tokenMint: z.string(),
  solMint: z.string(),
  timestamp: z.number().int().positive(),
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
  is_pump_fun: z.boolean()
});