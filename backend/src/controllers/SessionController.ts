import { Request, Response } from 'express';
import SessionService from '../services/SessionService';
import ProviderService from '../services/ProviderService';

export class SessionController {
    async createSession(req: Request, res: Response) {
        try {
            const { videoUrl, provider } = req.body;

            if (!videoUrl || !provider) {
                return res.status(400).json({
                    success: false,
                    message: 'Video URL and provider are required'
                });
            }

            // Provider'ın desteklenip desteklenmediğini kontrol et
            const providerExists = await ProviderService.findByDomain(provider);
            if (!providerExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported provider'
                });
            }

            const sessionId = await SessionService.createSession(videoUrl, provider);

            return res.json({
                success: true,
                sessionId
            });
        } catch (error) {
            console.error('Error in createSession:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getSession(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            const session = await SessionService.getSession(sessionId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            return res.json({
                success: true,
                session
            });
        } catch (error) {
            console.error('Error in getSession:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export default new SessionController(); 