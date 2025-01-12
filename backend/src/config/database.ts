import mongoose from 'mongoose';
import { logInfo, logError } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/watchtogether';
const MONGODB_RETRY_ATTEMPTS = parseInt(process.env.MONGODB_RETRY_ATTEMPTS || '5', 10);
const MONGODB_RETRY_DELAY = parseInt(process.env.MONGODB_RETRY_DELAY || '5000', 10);

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private isConnected: boolean = false;
    private connectionPromise: Promise<typeof mongoose> | null = null;

    private constructor() {}

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async connect(): Promise<typeof mongoose> {
        if (this.isConnected) {
            return mongoose;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this.connectWithRetry();
        return this.connectionPromise;
    }

    private async connectWithRetry(attempt: number = 1): Promise<typeof mongoose> {
        try {
            logInfo(`Connecting to MongoDB (Attempt ${attempt}/${MONGODB_RETRY_ATTEMPTS})...`, { uri: MONGODB_URI });
            
            await mongoose.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;
            logInfo('Connected to MongoDB successfully');

            mongoose.connection.on('disconnected', () => {
                logError(new Error('MongoDB disconnected'), { context: 'MongoDB connection' });
                this.isConnected = false;
                this.connectionPromise = null;
                if (attempt < MONGODB_RETRY_ATTEMPTS) {
                    setTimeout(() => this.connectWithRetry(attempt + 1), MONGODB_RETRY_DELAY);
                }
            });

            mongoose.connection.on('error', (error) => {
                logError(error, { context: 'MongoDB connection error' });
                this.isConnected = false;
                this.connectionPromise = null;
                if (attempt < MONGODB_RETRY_ATTEMPTS) {
                    setTimeout(() => this.connectWithRetry(attempt + 1), MONGODB_RETRY_DELAY);
                }
            });

            return mongoose;
        } catch (error) {
            logError(error as Error, { 
                context: 'MongoDB connection',
                attempt,
                maxAttempts: MONGODB_RETRY_ATTEMPTS
            });

            if (attempt < MONGODB_RETRY_ATTEMPTS) {
                logInfo(`Retrying connection in ${MONGODB_RETRY_DELAY/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, MONGODB_RETRY_DELAY));
                return this.connectWithRetry(attempt + 1);
            }

            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            logInfo('Closing MongoDB connection...');
            await mongoose.connection.close();
            this.isConnected = false;
            this.connectionPromise = null;
            logInfo('MongoDB connection closed');
        }
    }

    public getConnection(): typeof mongoose {
        if (!this.isConnected) {
            throw new Error('Database is not connected. Call connect() first.');
        }
        return mongoose;
    }
}

export default DatabaseConnection.getInstance(); 