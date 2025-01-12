import { v4 as uuidv4 } from 'uuid';
import { logError } from '../utils/logger';
import { ISession } from '../types/session';

export class SessionService {
    private sessions: Map<string, ISession> = new Map();

    async createSession(userId: string, videoUrl: string): Promise<ISession> {
        const sessionId = uuidv4();
        const newSession: ISession = {
            id: sessionId,
            userId,
            videoUrl,
            participants: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.sessions.set(sessionId, newSession);

        return newSession;
    }

    async getSession(sessionId: string): Promise<ISession | null> {
        return this.sessions.get(sessionId) || null;
    }

    async updateSession(sessionId: string, updateData: Partial<ISession>): Promise<ISession | null> {
        const session = await this.getSession(sessionId);

        if (!session) {
            return null;
        }

        Object.assign(session, updateData);
        session.updatedAt = new Date();

        this.sessions.set(sessionId, session);

        return session;
    }

    async deleteSession(sessionId: string): Promise<boolean> {
        return this.sessions.delete(sessionId);
    }
}

export default new SessionService(); 