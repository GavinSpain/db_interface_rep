"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const heartbeat_routes_1 = __importDefault(require("../routes/heartbeat.routes"));
const transaction_routes_1 = __importDefault(require("../routes/transaction.routes"));
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const supabase_1 = require("../config/supabase");
const app = (0, express_1.default)();
const port = Number(env_1.config.ports.internal);
// CORS configuration for internal server
const corsOptions = {
    origin: function (origin, callback) {
        // Allow internal services only
        const allowedOrigins = [
            'http://localhost:3001',
            'http://localhost',
            'http://ec2-13-239-33-227.ap-southeast-2.compute.amazonaws.com:3001'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Register routes
app.use('/api/heartbeat', heartbeat_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
// Test endpoints
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/test/db', async (req, res) => {
    try {
        const startTime = Date.now();
        const { data, error } = await supabase_1.supabase.from('heartbeats').select('count');
        const endTime = Date.now();
        if (error) {
            logger_1.logger.error('Database test failed:', error);
            res.status(500).json({
                status: 'error',
                message: 'Database connection test failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return;
        }
        res.json({
            status: 'success',
            message: 'Database connection test successful',
            responseTime: `${endTime - startTime}ms`,
            data,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Database test error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection test failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
app.post('/api/test', (req, res) => {
    res.json({
        message: 'Data received',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Internal server is running',
        timestamp: new Date().toISOString()
    });
});
const server = app.listen(port, '0.0.0.0', () => {
    logger_1.logger.success(`Internal server running on http://0.0.0.0:${port}`);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled rejection:', { reason, promise });
});
