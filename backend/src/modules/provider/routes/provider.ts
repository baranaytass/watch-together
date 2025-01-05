import { Router } from 'express';
import { ProviderController } from '../controllers/ProviderController';
import { ProviderService } from '../services/ProviderService';
import { ProviderRepository } from '../repositories/ProviderRepository';

const router = Router();
const providerRepository = new ProviderRepository();
const providerService = new ProviderService(providerRepository);
const providerController = new ProviderController(providerService);

router.get('/', providerController.getAll);
router.post('/check', providerController.checkDomain);

export default router; 