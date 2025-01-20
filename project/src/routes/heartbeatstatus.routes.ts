import { Router } from 'express';
import { HeartbeatStatusController } from '../controllers/heartbeatstatus.controller';

const router = Router();
const controller = new HeartbeatStatusController();

router.get('/', controller.getStatus);

export default router;