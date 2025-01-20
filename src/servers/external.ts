import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import heartbeatStatusRoutes from '../routes/heartbeatstatus.routes';
import { logger } from '../utils/logger';
import { config } from '../config/env';

const app = express();
const port = Number(config.ports.external);

// SSL configuration
const sslOptions = {
  key: fs.readFileSync(config.ssl.key),
  cert: fs.readFileSync(config.ssl.cert)
};

// Request logging middleware
app.use((req, res, next) => {
  logger.request(req);
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    logger.response(res, body);
    return originalJson.call(this, body);
  };
  next();
});

// CORS configuration for external server
const corsOptions = {
  origin: '*', // Allow all origins for public API
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Register routes
app.use('/api/heartbeatstatus', heartbeatStatusRoutes);

// Create HTTPS server
const server = https.createServer(sslOptions, app);

const httpsServer = server.listen(port, '0.0.0.0', () => {
  logger.success(`External HTTPS server running on https://0.0.0.0:${port}`);
});

// Handle server errors
server.on('error', (error) => {
  logger.error('External server error:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
});