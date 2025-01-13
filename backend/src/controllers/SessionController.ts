import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logInfo, logError } from '../utils/logger';
import redisService from '../services/RedisService';

export class SessionController {
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { videoUrl } = req.body;

            if (!videoUrl) {
                throw new BadRequestError('Video URL is required');
            }

            const sessionId = uuidv4();
            const sessionData = {
                id: sessionId,
                videoUrl,
                createdAt: new Date(),
                participants: []
            };

            await redisService.setSession(sessionId, sessionData);

            logInfo('Session created successfully', { sessionId, videoUrl });

            res.status(201).json({
                success: true,
                session: {
                    id: sessionId,
                    url: `${process.env.FRONTEND_URL}/watch/${sessionId}`
                }
            });
        } catch (error) {
            logError(error as Error, {
                context: 'SessionController.createSession',
                body: req.body
            });
            next(error);
        }
    }

    async getSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                throw new BadRequestError('Session ID is required');
            }

            const session = await redisService.getSession(sessionId);

            if (!session) {
                throw new NotFoundError('Session not found');
            }

            logInfo('Session retrieved successfully', { sessionId });

            res.json({
                success: true,
                session
            });
        } catch (error) {
            logError(error as Error, {
                context: 'SessionController.getSession',
                sessionId: req.params.sessionId
            });
            next(error);
        }
    }
}

export default new SessionController(); 