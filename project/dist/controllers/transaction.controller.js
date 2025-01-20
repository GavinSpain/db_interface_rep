"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class TransactionController {
    constructor() {
        this.store = async (req, res) => {
            try {
                if (!req.body.transactions || !Array.isArray(req.body.transactions)) {
                    res.status(400).json({
                        error: 'Invalid request format',
                        message: 'Request body must contain a "transactions" array'
                    });
                    return;
                }
                // Extract all fields from each transaction
                const simplifiedTransactions = req.body.transactions.map((tx) => ({
                    signature: tx.signature,
                    tokenMint: tx.tokenMint,
                    solMint: tx.solMint,
                    timestamp: tx.timestamp,
                    liquidity_usd: tx.liquidity_usd,
                    volume_24h: tx.volume_24h,
                    price_usd: tx.price_usd,
                    holders: tx.holders,
                    risk_score: tx.risk_score,
                    risk_level: tx.risk_level,
                    is_honeypot: tx.is_honeypot,
                    is_mintable: tx.is_mintable,
                    is_ownership_renounced: tx.is_ownership_renounced,
                    has_high_concentration: tx.has_high_concentration,
                    is_pump_fun: tx.is_pump_fun
                }));
                const results = await this.service.createTransactions(simplifiedTransactions);
                res.status(201).json(results);
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    res.status(400).json({
                        error: 'Validation error',
                        details: error.errors
                    });
                    return;
                }
                logger_1.logger.error('Error processing request:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.index = async (_req, res) => {
            try {
                const transactions = await this.service.getAllTransactions();
                res.json(transactions);
            }
            catch (error) {
                logger_1.logger.error('Error retrieving transactions:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.service = new transaction_service_1.TransactionService();
    }
}
exports.TransactionController = TransactionController;
