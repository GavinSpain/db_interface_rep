import express from 'express';
import cors from 'cors';
import heartbeatRoutes from './routes/heartbeat.routes';
import transactionRoutes from './routes/transaction.routes';
import { logger } from './utils/logger';

const app = express();
const port = 3001;

const allowedOrigins = [
    'https://spainymatrix.xyz',
    'https://www.spainymatrix.xyz',
    'http://localhost',
    'http://localhost:3001'
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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

// Register routes
app.use('/api', heartbeatRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/heartbeatstatus', (_req, res) => {
    const heartbeatData = [];
    
    for (let i = 1; i <= 5; i++) {
        heartbeatData.push({ 
            service_id: i,
            seconds_since_last: Math.floor(Math.random() * 30)
        });
    }
    
    const response = {
        heartbeats: heartbeatData
    };

    logger.info('Sending response:', response);
    res.json(response);
});

// Start HTTP server
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export default app;