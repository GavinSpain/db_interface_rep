import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import heartbeatRoutes from './routes/heartbeat.routes';
import transactionRoutes from './routes/transaction.routes';
import { logger } from './utils/logger';

const app = express();
const port = 3001;

// SSL configuration
const sslOptions = {
  key: fs.readFileSync('/etc/ssl/key.pem'),
  cert: fs.readFileSync('/etc/ssl/cert.pem')
};

logger.info('SSL certificates loaded successfully');

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

// CORS configuration with dynamic origin handling
const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      logger.info('Allowing request with no origin');
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
    const isAllowed = 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.netlify.app') ||
      origin.includes('netlify') ||
      origin.includes('webcontainer-api.io') ||  // Allow WebContainer URLs
      origin.includes('local-credentialless');   // Allow local credentialless URLs

    if (isAllowed) {
      logger.info(`Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      logger.error(`Blocked origin: ${origin}`);
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

app.use(cors(corsOptions));
app.use(express.json());

// Register routes
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/transactions', transactionRoutes);

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
app.options('*', cors(corsOptions));

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(port, '0.0.0.0', () => {
  logger.success(`Server running on https://0.0.0.0:${port}`);
  logger.info('CORS configuration enabled with dynamic origin checking');
  logger.info('SSL/TLS enabled');
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
});