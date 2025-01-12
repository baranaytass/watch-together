import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import providerRoutes from './routes/provider';
import sessionRoutes from './routes/session';
import webRoutes from './routes/web';
import WebSocketService from './services/WebSocketService';
import { errorHandler } from './utils/errors';
import { apiLimiter } from './middleware/rateLimiter';
import seedProviders from './scripts/seedProviders';
import { logInfo, logError } from './utils/logger';
import database from './config/database';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// WebSocket Service
new WebSocketService(httpServer);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api/', apiLimiter);

// Health Check
app.get('/health', async (req, res) => {
  const isMongoConnected = database.getConnection().connection.readyState === 1;
  if (!isMongoConnected) {
    return res.status(503).json({ 
      status: 'ERROR',
      message: 'MongoDB not connected',
      timestamp: new Date().toISOString()
    });
  }
  res.status(200).json({ 
    status: 'OK',
    mongodb: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/providers', providerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/watch', webRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Global Error Handler
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();

    // Seed providers
    logInfo('Starting provider seeding...');
    await seedProviders();
    logInfo('Provider seeding completed');

    // Start server only after successful MongoDB connection
    httpServer.listen(PORT, () => {
      logInfo(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    logError(error as Error, { context: 'Server startup' });
    process.exit(1);
  }
};

// Graceful Shutdown
const gracefulShutdown = async () => {
  logInfo('SIGTERM signal received. Starting graceful shutdown...');
  
  try {
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        logInfo('HTTP server closed');
        resolve();
      });
    });

    await database.disconnect();

    process.exit(0);
  } catch (error) {
    logError(error as Error, { context: 'Graceful shutdown' });
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();

export default app;
