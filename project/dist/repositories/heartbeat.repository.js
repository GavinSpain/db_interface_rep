"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatRepository = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
class HeartbeatRepository {
    async upsert(serviceId, timestamp) {
        try {
            logger_1.logger.debug('Attempting to update heartbeat', { serviceId, timestamp });
            const { data: existingData, error: updateError } = await supabase_1.supabase
                .from('heartbeats')
                .update({ last_heartbeat: timestamp })
                .eq('service_id', serviceId)
                .select()
                .single();
            if (updateError && updateError.code === 'PGRST116') {
                logger_1.logger.debug('No existing heartbeat found, creating new one');
                const { data: newData, error: insertError } = await supabase_1.supabase
                    .from('heartbeats')
                    .insert({
                    service_id: serviceId,
                    last_heartbeat: timestamp
                })
                    .select()
                    .single();
                if (insertError) {
                    logger_1.logger.error('Error inserting heartbeat:', insertError);
                    throw new Error(`Heartbeat insert error: ${insertError.message}`);
                }
                return newData;
            }
            if (updateError) {
                logger_1.logger.error('Error updating heartbeat:', updateError);
                throw new Error(`Heartbeat update error: ${updateError.message}`);
            }
            return existingData;
        }
        catch (error) {
            logger_1.logger.error('Repository operation failed:', error);
            throw error;
        }
    }
    async getLastHeartbeat(serviceId) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('heartbeats')
                .select('*')
                .eq('service_id', serviceId)
                .single();
            if (error && error.code !== 'PGRST116') {
                logger_1.logger.error('Error fetching heartbeat:', error);
                throw new Error(`Query error: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Repository operation failed:', error);
            throw error;
        }
    }
    async findAll() {
        try {
            const { data, error } = await supabase_1.supabase
                .from('heartbeats')
                .select('*')
                .order('service_id', { ascending: true });
            if (error) {
                logger_1.logger.error('Error fetching all heartbeats:', error);
                throw new Error(`Query error: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Repository operation failed:', error);
            throw error;
        }
    }
}
exports.HeartbeatRepository = HeartbeatRepository;
