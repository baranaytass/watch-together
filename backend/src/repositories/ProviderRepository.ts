import { Provider } from '../types';
import ProviderModel from '../models/Provider';

export interface IProviderRepository {
  findAll(): Promise<Provider[]>;
  findByDomain(domain: string): Promise<Provider | null>;
  create(provider: Provider): Promise<Provider>;
  update(id: string, provider: Partial<Provider>): Promise<Provider | null>;
}

export class ProviderRepository implements IProviderRepository {
  async findAll(): Promise<Provider[]> {
    return ProviderModel.find({ isActive: true });
  }

  async findByDomain(domain: string): Promise<Provider | null> {
    return ProviderModel.findOne({
      domain: { $regex: domain, $options: 'i' },
      isActive: true
    });
  }

  async create(provider: Provider): Promise<Provider> {
    return ProviderModel.create(provider);
  }

  async update(id: string, provider: Partial<Provider>): Promise<Provider | null> {
    return ProviderModel.findByIdAndUpdate(id, provider, { new: true });
  }
} 