"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_controller_1 = require("../transaction.controller");
const transaction_service_1 = require("../../services/transaction.service");
// Mock the TransactionService
jest.mock('../../services/transaction.service');
describe('TransactionController', () => {
    let controller;
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
    const validTransaction = {
        signature: "GvN4or77m8ih1Qv4QTHubnQRi4KLsamNqFp6B8GvZw1zzj6HqSSqR1yckxkmDs454NUKmWpLycXfoj7hW4jDAKP",
        tokenMint: "3HDtQKLxSQCsUpVLC53A6rE987LhqsbySDJHKfBorvLM",
        solMint: "So11111111111111111111111111111111111111112",
        timestamp: 1736158252832,
        liquidity_usd: 50000.00,
        volume_24h: 25000.00,
        price_usd: 0.15,
        holders: 1500,
        risk_score: 50,
        risk_level: 'MEDIUM',
        is_honeypot: false,
        is_mintable: true,
        is_ownership_renounced: false,
        has_high_concentration: true,
        is_pump_fun: false
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockJson = jest.fn().mockReturnThis();
        mockStatus = jest.fn().mockReturnThis();
        mockResponse = {
            json: mockJson,
            status: mockStatus,
        };
        controller = new transaction_controller_1.TransactionController();
    });
    describe('store', () => {
        it('should store transaction successfully', async () => {
            mockRequest = {
                body: {
                    transactions: [validTransaction]
                }
            };
            const mockResult = [{
                    ...validTransaction,
                    id: 'uuid-1',
                    created_at: new Date().toISOString()
                }];
            transaction_service_1.TransactionService.prototype.createTransactions.mockResolvedValue(mockResult);
            await controller.store(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });
        it('should handle validation errors', async () => {
            mockRequest = {
                body: {
                    transactions: [{
                            ...validTransaction,
                            tokenMint: 'invalid'
                        }]
                }
            };
            transaction_service_1.TransactionService.prototype.createTransactions.mockRejectedValue({
                name: 'ZodError',
                errors: [{ message: 'Token mint must be exactly 44 characters long' }]
            });
            await controller.store(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Validation error',
                details: [{ message: 'Token mint must be exactly 44 characters long' }]
            });
        });
    });
    describe('index', () => {
        it('should retrieve all transactions successfully', async () => {
            const mockTransactions = [
                {
                    ...validTransaction,
                    id: 'uuid-1',
                    created_at: new Date().toISOString()
                }
            ];
            transaction_service_1.TransactionService.prototype.getAllTransactions.mockResolvedValue(mockTransactions);
            await controller.index(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(mockTransactions);
        });
        it('should handle errors when retrieving transactions', async () => {
            transaction_service_1.TransactionService.prototype.getAllTransactions.mockRejectedValue(new Error('Database error'));
            await controller.index(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
