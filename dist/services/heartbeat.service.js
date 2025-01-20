"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatService = void 0;
const heartbeat_repository_1 = require("../repositories/heartbeat.repository");
const zod_1 = require("zod");
const heartbeatSchema = zod_1.z.object({
    service_id: zod_1.z.number().int().min(1).max(5),
    timestamp: zod_1.z.string().datetime()
});
class HeartbeatService {
    constructor() {
        this.STALE_THRESHOLD_MS = 30000; // 30 seconds
        this.repository = new heartbeat_repository_1.HeartbeatRepository();
    }
    async updateHeartbeat(serviceId, timestamp) {
        const validated = heartbeatSchema.parse({ service_id: serviceId, timestamp });
        return await this.repository.upsert(validated.service_id, validated.timestamp);
    }
    async getTimeSinceLastHeartbeat(serviceId) {
        if (serviceId === 0) {
            const allHeartbeats = await this.repository.findAll();
            const heartbeats = allHeartbeats.map(heartbeat => {
                const seconds = this.calculateSecondsSince(heartbeat.last_heartbeat);
                if (this.isHeartbeatStale(heartbeat.last_heartbeat)) {
                    return {
                        service_id: heartbeat.service_id,
                        seconds_since_last: -1
                    };
                }
                return {
                    service_id: heartbeat.service_id,
                    seconds_since_last: seconds
                };
            });
            return { heartbeats };
        }
        const validated = heartbeatSchema.shape.service_id.parse(serviceId);
        const heartbeat = await this.repository.getLastHeartbeat(validated);
        if (!heartbeat) {
            return { seconds_since_last: -1 };
        }
        if (this.isHeartbeatStale(heartbeat.last_heartbeat)) {
            return { seconds_since_last: -1 };
        }
        const seconds = this.calculateSecondsSince(heartbeat.last_heartbeat);
        return {
            service_id: serviceId,
            seconds_since_last: seconds
        };
    }
    calculateSecondsSince(timestamp) {
        const lastHeartbeat = new Date(timestamp);
        const now = new Date();
        if (lastHeartbeat > now) {
            return 0;
        }
        const seconds = Math.floor((now.getTime() - lastHeartbeat.getTime()) / 1000);
        return Math.max(0, seconds);
    }
    isHeartbeatStale(timestamp) {
        const lastHeartbeat = new Date(timestamp);
        const now = new Date();
        const timeDiff = now.getTime() - lastHeartbeat.getTime();
        return timeDiff > this.STALE_THRESHOLD_MS;
    }
}
exports.HeartbeatService = HeartbeatService;
