import Provider, { IProvider } from '../models/Provider';
import { logDebug } from '../utils/logger';
import database from '../config/database';

export class ProviderRepository {
    async findByDomain(domain: string): Promise<IProvider | null> {
        await database.connect();
        
        logDebug('Finding provider by domain', { domain });
        
        const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
        logDebug('Normalized domain', { domain: normalizedDomain });
        
        const providers = await Provider.find({ isActive: true });
        logDebug('Found providers', { count: providers.length });
        
        const provider = providers.find(p => {
            const providerDomain = p.domain.toLowerCase().replace(/^www\./, '');
            logDebug('Comparing domains', { 
                original: p.domain, 
                normalized: providerDomain 
            });
            return providerDomain === normalizedDomain;
        });
        
        logDebug('Provider search result', { 
            found: !!provider,
            provider: provider ? {
                id: provider._id,
                name: provider.name,
                domain: provider.domain
            } : null
        });
        return provider || null;
    }

    async getAll(): Promise<IProvider[]> {
        await database.connect();
        return Provider.find({ isActive: true });
    }

    async create(providerData: Partial<IProvider>): Promise<IProvider> {
        await database.connect();
        const provider = new Provider(providerData);
        return provider.save();
    }
}

export default new ProviderRepository(); 