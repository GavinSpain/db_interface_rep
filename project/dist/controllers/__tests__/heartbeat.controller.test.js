"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const heartbeat_controller_1 = require("../heartbeat.controller");
const heartbeat_service_1 = require("../../services/heartbeat.service");
const zod_1 = require("zod");
jest.mock('../../services/heartbeat.service');
describe('HeartbeatController', () => {
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
        controller = new heartbeat_controller_1.HeartbeatController();
    });
    describe('update', () => {
        it('should update heartbeat successfully', async () => {
            mockRequest = {
                params: { serviceId: '1' }
            };
            const mockResult = {
                service_id: 1,
                last_heartbeat: new Date().toISOString()
            };
            heartbeat_service_1.HeartbeatService.prototype.updateHeartbeat.mockResolvedValue(mockResult);
            await controller.update(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });
        it('should handle validation errors', async () => {
            mockRequest = {
                params: { serviceId: '6' } // Invalid service ID
            };
            heartbeat_service_1.HeartbeatService.prototype.updateHeartbeat.mockRejectedValue(new zod_1.ZodError([{ message: 'Invalid service ID' }]));
            await controller.update(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Validation error',
                details: [{ message: 'Invalid service ID' }]
            });
        });
        it('should handle internal errors', async () => {
            mockRequest = {
                params: { serviceId: '1' }
            };
            heartbeat_service_1.HeartbeatService.prototype.updateHeartbeat.mockRejectedValue(new Error('Database error'));
            await controller.update(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
