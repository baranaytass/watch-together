export interface Session {
    videoUrl: string;
    provider: string;
    createdAt: number;
}

export interface SessionResponse {
    success: boolean;
    session?: Session;
    message?: string;
} 