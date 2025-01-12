import { Router } from 'express';
import SessionService from '../services/SessionService';

const router = Router();

router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await SessionService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // JSON string olarak session bilgilerini gönder
        res.send(`
            <html>
                <head>
                    <title>Watch Together Session</title>
                </head>
                <body>
                    <pre>${JSON.stringify(session, null, 2)}</pre>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error in web session view:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router; 