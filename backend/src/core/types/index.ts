export interface Provider {
  _id?: string;
  name: string;
  domain: string;
  selector: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id?: string;
  providerId: string;
  url: string;
  title: string;
  hostId: string;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
} 