"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenController = void 0;
const token_service_1 = require("../services/token.service");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class TokenController {
    constructor() {
        this.store = async (req, res) => {
            try {
                logger_1.logger.debug('Received token data:', req.body);
                const token = await this.service.createToken(req.body);
                res.status(201).json(token);
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    res.status(400).json({
                        error: 'Validation error',
                        details: error.errors
                    });
                    return;
                }
                logger_1.logger.error('Error processing token request:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.index = async (_req, res) => {
            try {
                const tokens = await this.service.getAllTokens();
                res.json(tokens);
            }
            catch (error) {
                logger_1.logger.error('Error retrieving tokens:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.show = async (req, res) => {
            try {
                const token = await this.service.getTokenBySignature(req.params.signature);
                if (!token) {
                    res.status(404).json({ error: 'Token not found' });
                    return;
                }
                res.json(token);
            }
            catch (error) {
                logger_1.logger.error('Error retrieving token:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.service = new token_service_1.TokenService();
    }
}
exports.TokenController = TokenController;
