import { Router } from 'express';
import { HeartbeatController } from '../controllers/heartbeat.controller';

const router = Router();
const controller = new HeartbeatController();

router.post('/:serviceId', controller.update);
router.get('/:serviceId?', controller.getTimeSince);
router.get('/heartbeatstatus', controller.getHeartbeatStatus);

export default router;