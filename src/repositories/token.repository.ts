import { supabase } from '../config/supabase';
import { Token } from '../types/token';
import { logger } from '../utils/logger';

export class TokenRepository {
  async create(token: Token): Promise<Token> {
    const { data, error } = await supabase
      .from('tokens')
      .insert(token)
      .select()
      .single();

    if (error) {
      logger.error('Error creating token:', error);
      throw new Error(`Token insert error: ${error.message}`);
    }

    return data;
  }

  async findAll(): Promise<Token[]> {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching tokens:', error);
      throw new Error(`Query error: ${error.message}`);
    }

    return data;
  }

  async findBySignature(signature: string): Promise<Token | null> {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('signature', signature)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      logger.error('Error fetching token by signature:', error);
      throw new Error(`Query error: ${error.message}`);
    }

    return data;
  }
}