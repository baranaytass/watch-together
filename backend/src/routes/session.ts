import { Router } from 'express';
import SessionController from '../controllers/SessionController';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Session oluşturma
router.post('/', apiLimiter, SessionController.createSession);

// Session bilgilerini getirme
router.get('/:sessionId', apiLimiter, SessionController.getSession);

export default router; 