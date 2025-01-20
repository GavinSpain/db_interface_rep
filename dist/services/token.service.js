"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const token_repository_1 = require("../repositories/token.repository");
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
const tokenSchema = zod_1.z.object({
    token_mint: zod_1.z.string(),
    sol_mint: zod_1.z.string(),
    liquidity_usd: zod_1.z.number().nonnegative(),
    volume_24h: zod_1.z.number().nonnegative(),
    price_usd: zod_1.z.number().nonnegative(),
    holders: zod_1.z.number().int().nonnegative(),
    risk_score: zod_1.z.number().int().min(0).max(100),
    risk_level: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']),
    is_honeypot: zod_1.z.boolean(),
    is_mintable: zod_1.z.boolean(),
    is_ownership_renounced: zod_1.z.boolean(),
    has_high_concentration: zod_1.z.boolean(),
    is_pump_fun: zod_1.z.boolean(),
    signature: zod_1.z.string()
});
class TokenService {
    constructor() {
        this.repository = new token_repository_1.TokenRepository();
    }
    async createToken(token) {
        logger_1.logger.debug('Creating token:', token);
        const validatedToken = tokenSchema.parse(token);
        return await this.repository.create({
            ...validatedToken,
            created_at: new Date().toISOString()
        });
    }
    async getAllTokens() {
        return await this.repository.findAll();
    }
    async getTokenBySignature(signature) {
        return await this.repository.findBySignature(signature);
    }
}
exports.TokenService = TokenService;
