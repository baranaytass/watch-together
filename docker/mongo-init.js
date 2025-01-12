db = db.getSiblingDB('watchtogether');

db.createCollection('providers');

db.providers.insertMany([
    {
        name: 'YouTube',
        domain: 'youtube.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]); 