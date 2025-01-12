export interface VideoState {
    isPlaying: boolean;
    currentTime: number;
    timestamp: number;
}

export interface SessionState extends VideoState {
    sessionId: string;
    participants: string[];
}

export interface ServerToClientEvents {
    stateUpdate: (state: VideoState) => void;
    participantJoined: (participantId: string) => void;
    participantLeft: (participantId: string) => void;
    error: (message: string) => void;
}

export interface ClientToServerEvents {
    joinSession: (sessionId: string) => void;
    leaveSession: (sessionId: string) => void;
    updateState: (state: VideoState) => void;
} 