import { Router } from 'express';
import { HeartbeatController } from '../controllers/heartbeat.controller';

const router = Router();
const controller = new HeartbeatController();

router.get('/', controller.getTimeSince);

export default router;