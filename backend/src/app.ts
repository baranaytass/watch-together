import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import providerRoutes from './modules/provider/routes/providerRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/providers', providerRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/watchtogether')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

export default app;
