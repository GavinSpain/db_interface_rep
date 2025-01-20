"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatController = void 0;
const heartbeat_service_1 = require("../services/heartbeat.service");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class HeartbeatController {
    constructor() {
        this.update = async (req, res) => {
            try {
                const serviceId = parseInt(req.params.serviceId, 10);
                const timestamp = new Date().toISOString();
                const result = await this.service.updateHeartbeat(serviceId, timestamp);
                res.status(200).json(result);
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    res.status(400).json({
                        error: 'Validation error',
                        details: error.errors
                    });
                    return;
                }
                logger_1.logger.error('Error updating heartbeat:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.service = new heartbeat_service_1.HeartbeatService();
    }
}
exports.HeartbeatController = HeartbeatController;
