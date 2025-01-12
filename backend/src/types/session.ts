export interface ISession {
    id: string;
    userId: string;
    videoUrl: string;
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
} 