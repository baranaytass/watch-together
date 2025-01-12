import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına limit
    standardHeaders: true,
    legacyHeaders: false,
    handler: (request: Request, response: Response, next: NextFunction) => {
        throw new BadRequestError('Too many requests, please try again later.');
    },
    skip: (request: Request) => {
        return request.path === '/health';
    }
});

// Daha sıkı limit gerektiren rotalar için
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (request: Request, response: Response, next: NextFunction) => {
        throw new BadRequestError('Too many requests, please try again later.');
    }
}); 