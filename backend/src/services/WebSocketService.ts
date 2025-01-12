import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import SessionService from './SessionService';
import { CustomError, NotFoundError } from '../utils/errors';

interface SessionState {
  sessionId: string;
  isPlaying: boolean;
  currentTime: number;
  timestamp: number;
  participants: string[];
}

export class WebSocketService {
  private io: Server;
  private sessions: Map<string, SessionState>;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
      }
    });
    this.sessions = new Map();
    this.setupEventHandlers();
  }

  private handleError(socket: Socket, error: Error) {
    console.error('WebSocket error:', {
      error: error.message,
      stack: error.stack,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    if (error instanceof CustomError) {
      socket.emit('error', {
        message: error.message,
        code: error.errorCode,
        details: error.details
      });
    } else {
      socket.emit('error', {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinSession', async (sessionId: string) => {
        try {
          const session = await SessionService.getSession(sessionId);
          if (!session) {
            throw new NotFoundError('Session not found');
          }

          socket.join(sessionId);
          
          if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
              sessionId,
              isPlaying: false,
              currentTime: 0,
              timestamp: Date.now(),
              participants: [socket.id]
            });
          } else {
            const sessionState = this.sessions.get(sessionId)!;
            if (!sessionState.participants.includes(socket.id)) {
              sessionState.participants.push(socket.id);
              this.sessions.set(sessionId, sessionState);
            }
          }

          const sessionState = this.sessions.get(sessionId)!;
          socket.emit('stateUpdate', {
            isPlaying: sessionState.isPlaying,
            currentTime: this.calculateCurrentTime(sessionState),
            timestamp: Date.now()
          });

          this.io.to(sessionId).emit('participantJoined', {
            participantId: socket.id,
            totalParticipants: sessionState.participants.length
          });
        } catch (error) {
          this.handleError(socket, error as Error);
        }
      });

      socket.on('leaveSession', (sessionId: string) => {
        try {
          this.handleLeaveSession(socket, sessionId);
        } catch (error) {
          this.handleError(socket, error as Error);
        }
      });

      socket.on('disconnect', () => {
        try {
          this.handleDisconnect(socket);
        } catch (error) {
          console.error('Error in disconnect handler:', error);
        }
      });

      socket.on('updateState', (sessionId: string, state: { isPlaying: boolean; currentTime: number }) => {
        try {
          this.handleStateUpdate(socket, sessionId, state);
        } catch (error) {
          this.handleError(socket, error as Error);
        }
      });
    });
  }

  private calculateCurrentTime(sessionState: SessionState): number {
    if (!sessionState.isPlaying) {
      return sessionState.currentTime;
    }
    const elapsed = (Date.now() - sessionState.timestamp) / 1000;
    return sessionState.currentTime + elapsed;
  }

  private handleLeaveSession(socket: Socket, sessionId: string): void {
    const sessionState = this.sessions.get(sessionId);
    if (sessionState) {
      sessionState.participants = sessionState.participants.filter(id => id !== socket.id);
      if (sessionState.participants.length === 0) {
        this.sessions.delete(sessionId);
      } else {
        this.sessions.set(sessionId, sessionState);
        this.io.to(sessionId).emit('participantLeft', {
          participantId: socket.id,
          totalParticipants: sessionState.participants.length
        });
      }
    }
    socket.leave(sessionId);
  }

  private handleDisconnect(socket: Socket): void {
    this.sessions.forEach((state, sessionId) => {
      if (state.participants.includes(socket.id)) {
        this.handleLeaveSession(socket, sessionId);
      }
    });
  }

  private handleStateUpdate(socket: Socket, sessionId: string, state: { isPlaying: boolean; currentTime: number }): void {
    const sessionState = this.sessions.get(sessionId);
    if (!sessionState) {
      throw new NotFoundError('Session not found');
    }

    if (!sessionState.participants.includes(socket.id)) {
      throw new CustomError('Not a participant of this session', 403, undefined, 'FORBIDDEN');
    }

    sessionState.isPlaying = state.isPlaying;
    sessionState.currentTime = state.currentTime;
    sessionState.timestamp = Date.now();
    this.sessions.set(sessionId, sessionState);

    socket.to(sessionId).emit('stateUpdate', {
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      timestamp: Date.now()
    });
  }
}

export default WebSocketService; 