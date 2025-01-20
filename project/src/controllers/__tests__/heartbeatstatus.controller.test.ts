import { Request, Response } from 'express';
import { HeartbeatStatusController } from '../heartbeatstatus.controller';
import { HeartbeatService } from '../../services/heartbeat.service';

jest.mock('../../services/heartbeat.service');

describe('HeartbeatStatusController', () => {
  let controller: HeartbeatStatusController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    controller = new HeartbeatStatusController();
  });

  describe('getStatus', () => {
    it('should return status for all services', async () => {
      const mockResult = {
        heartbeats: [
          { service_id: 1, seconds_since_last: 5 },
          { service_id: 2, seconds_since_last: 10 }
        ]
      };

      (HeartbeatService.prototype.getTimeSinceLastHeartbeat as jest.Mock).mockResolvedValue(mockResult);

      await controller.getStatus(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (HeartbeatService.prototype.getTimeSinceLastHeartbeat as jest.Mock).mockRejectedValue(error);

      await controller.getStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});