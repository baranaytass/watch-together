import { Router } from 'express';
import SessionController from '../controllers/SessionController';

const router = Router();

router.post('/', SessionController.createSession);
router.get('/:sessionId', SessionController.getSession);

export default router; 