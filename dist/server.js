"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const heartbeat_routes_1 = __importDefault(require("./routes/heartbeat.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const port = 3001;
// SSL configuration
const sslOptions = {
    key: fs_1.default.readFileSync('/etc/ssl/key.pem'),
    cert: fs_1.default.readFileSync('/etc/ssl/cert.pem')
};
logger_1.logger.info('SSL certificates loaded successfully');
// Request logging middleware
app.use((req, res, next) => {
    logger_1.logger.request(req);
    next();
});
// Response logging middleware
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        logger_1.logger.response(res, body);
        return originalJson.call(this, body);
    };
    next();
});
// CORS configuration with dynamic origin handling
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            logger_1.logger.info('Allowing request with no origin');
            callback(null, true);
            return;
        }
        const allowedOrigins = [
            'http://localhost:3001',
            'http://localhost',
            'http://ec2-13-239-33-227.ap-southeast-2.compute.amazonaws.com:3001',
            'https://thunderous-gingersnap-b73325.netlify.app'
        ];
        // Check if the origin matches any of our conditions
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith('.netlify.app') ||
            origin.includes('netlify') ||
            origin.includes('webcontainer-api.io') || // Allow WebContainer URLs
            origin.includes('local-credentialless'); // Allow local credentialless URLs
        if (isAllowed) {
            logger_1.logger.info(`Allowing origin: ${origin}`);
            callback(null, true);
        }
        else {
            logger_1.logger.error(`Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-From-Netlify'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Register routes
app.use('/api/heartbeat', heartbeat_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
// Root endpoint for basic connectivity test
app.get('/', (req, res) => {
    res.json({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin header'
    });
});
// Test endpoints
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin header'
    });
});
app.post('/api/test', (req, res) => {
    res.json({
        message: 'Data received',
        data: req.body,
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin header'
    });
});
// OPTIONS handler for debugging
app.options('*', (0, cors_1.default)(corsOptions));
// Create HTTPS server
const server = https_1.default.createServer(sslOptions, app);
server.listen(port, '0.0.0.0', () => {
    logger_1.logger.success(`Server running on https://0.0.0.0:${port}`);
    logger_1.logger.info('CORS configuration enabled with dynamic origin checking');
    logger_1.logger.info('SSL/TLS enabled');
});
// Handle server errors
server.on('error', (error) => {
    logger_1.logger.error('Server error:', error);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled rejection:', { reason, promise });
});
