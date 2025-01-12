import { Router } from 'express';
import ProviderController from '../controllers/ProviderController';

const router = Router();

router.get('/check', ProviderController.checkDomain);
router.get('/', ProviderController.getAllProviders);

export default router; 