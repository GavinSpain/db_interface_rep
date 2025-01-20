import express from 'express';
import cors from 'cors';
import heartbeatRoutes from '../routes/heartbeat.routes';
import transactionRoutes from '../routes/transaction.routes';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { supabase } from '../config/supabase';
import { HeartbeatService } from '../services/heartbeat.service';
import { HeartbeatManager } from '../utils/heartbeat-manager';

const app = express();
const port = Number(config.ports.internal);
const heartbeatService = new HeartbeatService();

// Initialize HeartbeatManager
const heartbeatManager = HeartbeatManager.getInstance();

// CORS configuration for internal server
const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow internal services only
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost',
      'http://ec2-13-239-33-227.ap-southeast-2.compute.amazonaws.com:3001'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Register routes
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/transactions', transactionRoutes);

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
    const { data, error } = await supabase.from('heartbeats').select('count');
    const endTime = Date.now();
    
    if (error) {
      logger.error('Database test failed:', error);
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
  } catch (error) {
    logger.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// New test endpoint for heartbeat update
app.post('/api/test/heartbeat', async (req, res) => {
  try {
    const serviceId = config.heartbeat.serviceId; // Using the configured service ID
    const timestamp = new Date().toISOString();
    
    logger.info('Testing heartbeat update', { serviceId, timestamp });
    
    const result = await heartbeatService.updateHeartbeat(serviceId, timestamp);
    
    res.json({
      status: 'success',
      message: 'Heartbeat updated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Heartbeat test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Heartbeat update failed',
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
  logger.success(`Internal server running on http://0.0.0.0:${port}`);
  
  // Start sending heartbeats
  heartbeatManager.start().catch(error => {
    logger.error('Failed to start heartbeat manager:', error);
  });
});

// Cleanup on server shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Cleaning up...');
  heartbeatManager.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Cleaning up...');
  heartbeatManager.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  heartbeatManager.stop();
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
});