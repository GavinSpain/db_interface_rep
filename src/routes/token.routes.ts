import express from 'express';
import cors from 'cors';
import heartbeatRoutes from './routes/heartbeat.routes';
import transactionRoutes from './routes/transaction.routes';
import { logger } from './utils/logger';
import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';
import { HeartbeatController } from '../controllers/heartbeat.controller';
import { Request, Response } from 'express';

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
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    logger.request(req);
    next();
});

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function(body) {
        logger.response(res, body);
        return originalJson.call(this, body);
    };
    next();
});

// Routes
app.use('/api', heartbeatRoutes);
app.use('/api/transactions', transactionRoutes);

const tokenRouter = Router();
const tokenController = new TokenController();

tokenRouter.post('/', tokenController.store);
tokenRouter.get('/', tokenController.index);
tokenRouter.get('/:signature', tokenController.show);

app.use('/api/tokens', tokenRouter);

const heartbeatRouter = Router();
const heartbeatController = new HeartbeatController();

heartbeatRouter.get('/status', heartbeatController.getHeartbeatStatus);
heartbeatRouter.post('/:serviceId', heartbeatController.updateHeartbeat);
heartbeatRouter.get('/:serviceId?', heartbeatController.getHeartbeat);

app.use('/api/heartbeat', heartbeatRouter);

import { Router } from 'express';
import { HeartbeatController } from '../controllers/heartbeat.controller';

const router = Router();
const controller = new HeartbeatController();

router.get('/heartbeatstatus', controller.getHeartbeatStatus);

app.use('/api', router);

app.listen(port, () => console.log(`Server running on port ${port}`));

export default app;

import { Request, Response } from 'express';

export class HeartbeatController {
    public getHeartbeatStatus = async (req: Request, res: Response) => {
        const heartbeatData = [];
        
        for (let i = 1; i <= 5; i++) {
            heartbeatData.push({ 
                service_id: i,
                seconds_since_last: Math.floor(Math.random() * 30)
            });
        }
        
        res.json({ heartbeats: heartbeatData });
    }
}

export default router;