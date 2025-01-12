import Provider, { IProvider } from '../models/Provider';
import { logDebug, logError } from '../utils/logger';
import ProviderRepository from '../repositories/ProviderRepository';

export class ProviderService {
    private repository: typeof ProviderRepository;

    constructor(repository = ProviderRepository) {
        this.repository = repository;
    }

    async findByDomain(domain: string): Promise<IProvider | null> {
        try {
            logDebug('Finding provider by domain', { domain });
            const provider = await this.repository.findByDomain(domain);
            logDebug('Provider search result', { 
                domain,
                found: !!provider,
                provider: provider ? { 
                    id: provider.id,
                    name: provider.name,
                    domain: provider.domain,
                    patterns: provider.patterns,
                    isActive: provider.isActive
                } : null 
            });
            return provider;
        } catch (error) {
            logError(error as Error, {
                context: 'ProviderService.findByDomain',
                domain
            });
            throw error;
        }
    }

    async getAll(): Promise<IProvider[]> {
        try {
            return this.repository.getAll();
        } catch (error) {
            logError(error as Error, {
                context: 'ProviderService.getAll'
            });
            throw error;
        }
    }

    async create(providerData: {
        name: string;
        domain: string;
        patterns: string[];
        isActive?: boolean;
    }): Promise<IProvider> {
        try {
            return this.repository.create(providerData);
        } catch (error) {
            logError(error as Error, {
                context: 'ProviderService.create',
                providerData
            });
            throw error;
        }
    }
}

export default new ProviderService(); 