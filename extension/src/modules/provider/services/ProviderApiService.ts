import { CustomError } from '../utils/errors';
import { Provider } from '../types';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface ProviderCheckResponse {
  supported: boolean;
  provider: Provider | null;
}

export class ApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:5000/api';
  }

  private async fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new CustomError('API request failed', response.status);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async checkProvider(domain: string): Promise<ProviderCheckResponse> {
    const { data } = await this.fetchApi<ProviderCheckResponse>('/providers/check', {
      method: 'POST',
      body: JSON.stringify({ domain })
    });
    return data;
  }
}

export const apiService = new ApiService(); 