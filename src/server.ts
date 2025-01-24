import express from 'express';
import cors from 'cors';
import heartbeatRoutes from './routes/heartbeat.routes';
import transactionRoutes from './routes/transaction.routes';
import { logger } from './utils/logger';

const app = express();
const port = 3001;

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

// Simplified CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost',
    'http://ec2-13-239-33-227.ap-southeast-2.compute.amazonaws.com:3001'
  ],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Register routes
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/transactions', transactionRoutes);

// Start HTTP server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export default app;