"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
class TokenRepository {
    async create(token) {
        const { data, error } = await supabase_1.supabase
            .from('tokens')
            .insert(token)
            .select()
            .single();
        if (error) {
            logger_1.logger.error('Error creating token:', error);
            throw new Error(`Token insert error: ${error.message}`);
        }
        return data;
    }
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from('tokens')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            logger_1.logger.error('Error fetching tokens:', error);
            throw new Error(`Query error: ${error.message}`);
        }
        return data;
    }
    async findBySignature(signature) {
        const { data, error } = await supabase_1.supabase
            .from('tokens')
            .select('*')
            .eq('signature', signature)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            logger_1.logger.error('Error fetching token by signature:', error);
            throw new Error(`Query error: ${error.message}`);
        }
        return data;
    }
}
exports.TokenRepository = TokenRepository;
