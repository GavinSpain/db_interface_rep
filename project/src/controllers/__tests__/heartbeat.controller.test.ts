import { Request, Response } from 'express';
import { HeartbeatController } from '../heartbeat.controller';
import { HeartbeatService } from '../../services/heartbeat.service';
import { ZodError } from 'zod';

jest.mock('../../services/heartbeat.service');

describe('HeartbeatController', () => {
  let controller: HeartbeatController;
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
    controller = new HeartbeatController();
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

      (HeartbeatService.prototype.updateHeartbeat as jest.Mock).mockResolvedValue(mockResult);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should handle validation errors', async () => {
      mockRequest = {
        params: { serviceId: '6' } // Invalid service ID
      };

      (HeartbeatService.prototype.updateHeartbeat as jest.Mock).mockRejectedValue(
        new ZodError([{ message: 'Invalid service ID' }])
      );

      await controller.update(mockRequest as Request, mockResponse as Response);

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

      (HeartbeatService.prototype.updateHeartbeat as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});