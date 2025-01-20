import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';

const router = Router();
const controller = new TokenController();

router.post('/', controller.store);
router.get('/', controller.index);
router.get('/:signature', controller.show);

export default router;