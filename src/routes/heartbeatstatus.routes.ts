import { Router } from 'express';
import { HeartbeatController } from '../controllers/heartbeat.controller';

const router = Router();
const controller = new HeartbeatController();

router.get('/', controller.getTimeSince);
router.get('/heartbeatstatus', controller.getHeartbeatStatus);

export default router;