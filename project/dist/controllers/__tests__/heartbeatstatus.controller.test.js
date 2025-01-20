"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const heartbeatstatus_controller_1 = require("../heartbeatstatus.controller");
const heartbeat_service_1 = require("../../services/heartbeat.service");
jest.mock('../../services/heartbeat.service');
describe('HeartbeatStatusController', () => {
    let controller;
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
    beforeEach(() => {
        jest.clearAllMocks();
        mockJson = jest.fn().mockReturnThis();
        mockStatus = jest.fn().mockReturnThis();
        mockResponse = {
            json: mockJson,
            status: mockStatus,
        };
        controller = new heartbeatstatus_controller_1.HeartbeatStatusController();
    });
    describe('getStatus', () => {
        it('should return status for all services', async () => {
            const mockResult = {
                heartbeats: [
                    { service_id: 1, seconds_since_last: 5 },
                    { service_id: 2, seconds_since_last: 10 }
                ]
            };
            heartbeat_service_1.HeartbeatService.prototype.getTimeSinceLastHeartbeat.mockResolvedValue(mockResult);
            await controller.getStatus(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            heartbeat_service_1.HeartbeatService.prototype.getTimeSinceLastHeartbeat.mockRejectedValue(error);
            await controller.getStatus(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
