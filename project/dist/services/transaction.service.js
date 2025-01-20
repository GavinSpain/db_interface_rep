"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_repository_1 = require("../repositories/transaction.repository");
const transaction_schema_1 = require("../schemas/transaction.schema");
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
class TransactionService {
    constructor() {
        this.repository = new transaction_repository_1.TransactionRepository();
    }
    async createTransactions(transactions) {
        logger_1.logger.info('Processing transactions:', transactions);
        // Validate all transactions first
        const transactionArraySchema = zod_1.z.array(transaction_schema_1.transactionSchema);
        const validatedTransactions = transactionArraySchema.parse(transactions);
        // Process all transactions
        const results = await Promise.all(validatedTransactions.map(transaction => this.repository.upsert(transaction)));
        return results;
    }
    async getAllTransactions() {
        return await this.repository.findAll();
    }
}
exports.TransactionService = TransactionService;
