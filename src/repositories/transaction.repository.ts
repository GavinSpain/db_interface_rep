import { supabase } from '../config/supabase';
import { Transaction, TransactionRecord } from '../types/transaction';
import { logger } from '../utils/logger';

export class TransactionRepository {
  async upsert(transaction: Transaction): Promise<TransactionRecord> {
    // First try to update if exists
    const { data: existingData, error: existingError } = await supabase
      .from('transactions')
      .update({
        token_mint: transaction.tokenMint,
        sol_mint: transaction.solMint,
        timestamp: transaction.timestamp,
        liquidity_usd: transaction.liquidity_usd,
        volume_24h: transaction.volume_24h,
        price_usd: transaction.price_usd,
        holders: transaction.holders,
        risk_score: transaction.risk_score,
        risk_level: transaction.risk_level,
        is_honeypot: transaction.is_honeypot,
        is_mintable: transaction.is_mintable,
        is_ownership_renounced: transaction.is_ownership_renounced,
        has_high_concentration: transaction.has_high_concentration,
        is_pump_fun: transaction.is_pump_fun
      })
      .eq('signature', transaction.signature)
      .select()
      .single();

    // If record doesn't exist (no rows updated), insert it
    if (existingError && existingError.code === 'PGRST116') { // PGRST116 is "not found"
      const { data: newData, error: insertError } = await supabase
        .from('transactions')
        .insert({
          signature: transaction.signature,
          token_mint: transaction.tokenMint,
          sol_mint: transaction.solMint,
          timestamp: transaction.timestamp,
          liquidity_usd: transaction.liquidity_usd,
          volume_24h: transaction.volume_24h,
          price_usd: transaction.price_usd,
          holders: transaction.holders,
          risk_score: transaction.risk_score,
          risk_level: transaction.risk_level,
          is_honeypot: transaction.is_honeypot,
          is_mintable: transaction.is_mintable,
          is_ownership_renounced: transaction.is_ownership_renounced,
          has_high_concentration: transaction.has_high_concentration,
          is_pump_fun: transaction.is_pump_fun
        })
        .select()
        .single();

      if (insertError) {
        logger.error('Error creating transaction:', insertError);
        throw new Error(`Transaction insert error: ${insertError.message}`);
      }

      return this.mapToTransactionRecord(newData);
    }

    if (existingError) {
      logger.error('Error updating transaction:', existingError);
      throw new Error(`Transaction update error: ${existingError.message}`);
    }

    return this.mapToTransactionRecord(existingData);
  }

  private mapToTransactionRecord(data: any): TransactionRecord {
    return {
      id: data.id,
      signature: data.signature,
      tokenMint: data.token_mint,
      solMint: data.sol_mint,
      timestamp: data.timestamp,
      liquidity_usd: data.liquidity_usd,
      volume_24h: data.volume_24h,
      price_usd: data.price_usd,
      holders: data.holders,
      risk_score: data.risk_score,
      risk_level: data.risk_level,
      is_honeypot: data.is_honeypot,
      is_mintable: data.is_mintable,
      is_ownership_renounced: data.is_ownership_renounced,
      has_high_concentration: data.has_high_concentration,
      is_pump_fun: data.is_pump_fun,
      created_at: data.created_at
    };
  }

  async findAll(): Promise<TransactionRecord[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching transactions:', error);
      throw new Error(`Query error: ${error.message}`);
    }

    return data.map(record => this.mapToTransactionRecord(record));
  }
}