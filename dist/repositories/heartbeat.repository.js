"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatRepository = void 0;
const supabase_1 = require("../config/supabase");
class HeartbeatRepository {
    async upsert(serviceId, timestamp) {
        const { data: existingData, error: updateError } = await supabase_1.supabase
            .from('heartbeats')
            .update({ last_heartbeat: timestamp })
            .eq('service_id', serviceId)
            .select()
            .single();
        if (updateError && updateError.code === 'PGRST116') {
            const { data: newData, error: insertError } = await supabase_1.supabase
                .from('heartbeats')
                .insert({
                service_id: serviceId,
                last_heartbeat: timestamp
            })
                .select()
                .single();
            if (insertError) {
                throw new Error(`Heartbeat insert error: ${insertError.message}`);
            }
            return newData;
        }
        if (updateError) {
            throw new Error(`Heartbeat update error: ${updateError.message}`);
        }
        return existingData;
    }
    async getLastHeartbeat(serviceId) {
        const { data, error } = await supabase_1.supabase
            .from('heartbeats')
            .select('*')
            .eq('service_id', serviceId)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Query error: ${error.message}`);
        }
        return data;
    }
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from('heartbeats')
            .select('*')
            .order('service_id', { ascending: true });
        if (error) {
            throw new Error(`Query error: ${error.message}`);
        }
        return data || [];
    }
}
exports.HeartbeatRepository = HeartbeatRepository;
