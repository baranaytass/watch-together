import Redis from 'ioredis';
import { logInfo, logError } from '../utils/logger';

export class RedisService {
    private static instance: RedisService;
    private client: Redis;

    private constructor() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.client = new Redis(redisUrl, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.client.on('connect', () => {
            logInfo('Connected to Redis successfully');
        });

        this.client.on('error', (error) => {
            logError(error, { context: 'Redis connection' });
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async setSession(sessionId: string, sessionData: any, expirationInSeconds: number = 24 * 60 * 60): Promise<void> {
        try {
            await this.client.setex(
                `session:${sessionId}`,
                expirationInSeconds,
                JSON.stringify(sessionData)
            );
            logInfo('Session saved to Redis', { sessionId });
        } catch (error) {
            logError(error as Error, {
                context: 'RedisService.setSession',
                sessionId
            });
            throw error;
        }
    }

    public async getSession(sessionId: string): Promise<any | null> {
        try {
            const data = await this.client.get(`session:${sessionId}`);
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        } catch (error) {
            logError(error as Error, {
                context: 'RedisService.getSession',
                sessionId
            });
            throw error;
        }
    }

    public async deleteSession(sessionId: string): Promise<void> {
        try {
            await this.client.del(`session:${sessionId}`);
            logInfo('Session deleted from Redis', { sessionId });
        } catch (error) {
            logError(error as Error, {
                context: 'RedisService.deleteSession',
                sessionId
            });
            throw error;
        }
    }
}

export default RedisService.getInstance(); 