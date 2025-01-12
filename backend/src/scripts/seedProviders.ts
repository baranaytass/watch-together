import mongoose from 'mongoose';
import Provider from '../models/Provider';
import { logInfo, logError, logDebug } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/watchtogether';

const providers = [
    {
        name: 'YouTube',
        domain: 'youtube.com',
        patterns: [
            'youtube.com/watch?v=*',
            'youtu.be/*',
            'm.youtube.com/watch?v=*'
        ]
    }
];

async function seedProviders() {
    try {
        logInfo('Starting provider seeding...');
        logInfo('Connecting to MongoDB...', { uri: MONGODB_URI });
        await mongoose.connect(MONGODB_URI);
        logInfo('Connected to MongoDB successfully');

        // Önce mevcut provider'ları temizle
        const deleteResult = await Provider.deleteMany({});
        logInfo('Cleared existing providers', { deletedCount: deleteResult.deletedCount });

        // Yeni provider'ları ekle
        logDebug('Attempting to create providers', { providers });
        const result = await Provider.create(providers);
        logInfo('Providers seeded successfully', { 
            count: result.length,
            providers: result.map(p => ({
                id: p.id,
                name: p.name,
                domain: p.domain
            }))
        });

        return result;
    } catch (error) {
        logError(error as Error, { 
            context: 'seedProviders',
            providers: providers 
        });
        throw error;
    }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
    seedProviders()
        .then(async () => {
            console.log('Seeding completed successfully');
            await mongoose.connection.close();
            process.exit(0);
        })
        .catch(async (error) => {
            console.error('Seeding failed:', error);
            await mongoose.connection.close();
            process.exit(1);
        });
}

export default seedProviders; 