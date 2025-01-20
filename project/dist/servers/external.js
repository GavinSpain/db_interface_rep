"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const heartbeatstatus_routes_1 = __importDefault(require("../routes/heartbeatstatus.routes"));
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const app = (0, express_1.default)();
const port = Number(env_1.config.ports.external);
// SSL configuration
const sslOptions = {
    key: fs_1.default.readFileSync(env_1.config.ssl.key),
    cert: fs_1.default.readFileSync(env_1.config.ssl.cert)
};
// CORS configuration for external server
const corsOptions = {
    origin: '*', // Allow all origins for public API
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 86400 // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Register routes
app.use('/api/heartbeatstatus', heartbeatstatus_routes_1.default);
// Create HTTPS server
const server = https_1.default.createServer(sslOptions, app);
const httpsServer = server.listen(port, '0.0.0.0', () => {
    logger_1.logger.success(`External HTTPS server running on https://0.0.0.0:${port}`);
});
// Handle server errors
server.on('error', (error) => {
    logger_1.logger.error('External server error:', error);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled rejection:', { reason, promise });
});
