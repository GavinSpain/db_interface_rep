import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
const controller = new TransactionController();

router.post('/', controller.store);
router.get('/', controller.index);

export default router;