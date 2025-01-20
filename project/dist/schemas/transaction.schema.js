"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSchema = void 0;
const zod_1 = require("zod");
exports.transactionSchema = zod_1.z.object({
    signature: zod_1.z.string(),
    tokenMint: zod_1.z.string(),
    solMint: zod_1.z.string(),
    timestamp: zod_1.z.number().int().positive(),
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
    is_pump_fun: zod_1.z.boolean()
});
