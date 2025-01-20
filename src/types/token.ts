export interface Token {
  id?: string;
  token_mint: string;
  sol_mint: string;
  liquidity_usd: number;
  volume_24h: number;
  price_usd: number;
  holders: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  is_honeypot: boolean;
  is_mintable: boolean;
  is_ownership_renounced: boolean;
  has_high_concentration: boolean;
  is_pump_fun: boolean;
  created_at?: string;
  signature: string;
}