export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Session {
  id: string;
  title: string;
  videoUrl: string;
  host: User;
  participants: User[];
  createdAt: Date;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffering: boolean;
} 