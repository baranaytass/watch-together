import { Request, Response, NextFunction } from 'express';
import ProviderService from '../services/ProviderService';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { validateDomain } from '../utils/validation';
import { logInfo, logDebug } from '../utils/logger';

export class ProviderController {
    async checkDomain(req: Request, res: Response, next: NextFunction) {
        try {
            const { url } = req.query;
            logInfo('Provider check request received', { url });

            if (!url || typeof url !== 'string') {
                throw new BadRequestError('URL parameter is required');
            }

            // URL'den domain'i çıkar
            let domain: string;
            try {
                const urlObj = new URL(url);
                domain = urlObj.hostname;
            } catch (error) {
                throw new BadRequestError('Invalid URL format');
            }

            if (!validateDomain(domain)) {
                throw new BadRequestError('Invalid domain format');
            }

            // Domain'i normalize et (www. veya m. öneklerini kaldır)
            const normalizedDomain = domain.replace(/^(www\.|m\.)/, '');
            logDebug('Normalized domain', { original: domain, normalized: normalizedDomain });

            const provider = await ProviderService.findByDomain(normalizedDomain);
            logInfo('Provider search result', { 
                domain: normalizedDomain, 
                found: !!provider,
                provider: provider ? { name: provider.name, patterns: provider.patterns } : null 
            });

            return res.json({
                success: true,
                isSupported: !!provider,
                provider: provider
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const providers = await ProviderService.getAll();
            
            if (!providers || providers.length === 0) {
                throw new NotFoundError('No providers found');
            }

            return res.json({
                success: true,
                providers
            });
        } catch (error) {
            next(error);
        }
    }

    async createProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, domain, patterns } = req.body;

            if (!name || !domain || !patterns) {
                throw new BadRequestError('Missing required fields', {
                    required: ['name', 'domain', 'patterns'],
                    received: Object.keys(req.body)
                });
            }

            if (!validateDomain(domain)) {
                throw new BadRequestError('Invalid domain format');
            }

            const existingProvider = await ProviderService.findByDomain(domain);
            if (existingProvider) {
                throw new BadRequestError('Provider with this domain already exists');
            }

            const provider = await ProviderService.create({
                name,
                domain,
                patterns
            });

            return res.status(201).json({
                success: true,
                provider
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ProviderController(); 