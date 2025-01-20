"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatStatusController = void 0;
const heartbeat_service_1 = require("../services/heartbeat.service");
const logger_1 = require("../utils/logger");
class HeartbeatStatusController {
    constructor() {
        this.getStatus = async (_req, res) => {
            try {
                const result = await this.service.getTimeSinceLastHeartbeat(0);
                res.json(result);
            }
            catch (error) {
                logger_1.logger.error('Error getting heartbeat status:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.service = new heartbeat_service_1.HeartbeatService();
    }
}
exports.HeartbeatStatusController = HeartbeatStatusController;
