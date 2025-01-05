import { Request, Response, NextFunction } from 'express';
import { IProviderService } from '../services/ProviderService';

export class ProviderController {
  constructor(private readonly providerService: IProviderService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = await this.providerService.getAllProviders();
      res.json(providers);
    } catch (error) {
      next(error);
    }
  };

  checkDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { domain } = req.body;
      const result = await this.providerService.checkDomain(domain);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
} 