import { Provider } from '../types';
import { IProviderRepository } from '../repositories/ProviderRepository';
import { CustomError } from '../utils/errors';

export interface IProviderService {
  getAllProviders(): Promise<Provider[]>;
  checkDomain(domain: string): Promise<{ supported: boolean; provider: Provider | null }>;
}

export class ProviderService implements IProviderService {
  constructor(private readonly providerRepository: IProviderRepository) {}

  async getAllProviders(): Promise<Provider[]> {
    try {
      return await this.providerRepository.findAll();
    } catch (error) {
      throw new CustomError('Failed to fetch providers', 500);
    }
  }

  async checkDomain(domain: string): Promise<{ supported: boolean; provider: Provider | null }> {
    try {
      if (!domain) {
        throw new CustomError('Domain is required', 400);
      }

      const provider = await this.providerRepository.findByDomain(domain);
      
      return {
        supported: !!provider,
        provider: provider
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to check domain', 500);
    }
  }
} 