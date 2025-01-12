import { Schema, model } from 'mongoose';
import { validateDomain, validateUrlPattern } from '../utils/validation';
import database from '../config/database';

export interface IProvider {
    id?: string;
    name: string;
    domain: string;
    patterns: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const providerSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    domain: {
        type: String,
        required: [true, 'Domain is required'],
        unique: true,
        trim: true,
        validate: {
            validator: (value: string) => validateDomain(value),
            message: 'Invalid domain format'
        }
    },
    patterns: {
        type: [String],
        required: [true, 'At least one URL pattern is required'],
        validate: {
            validator: (value: string[]) => {
                return value.length > 0 && value.every(pattern => validateUrlPattern(pattern));
            },
            message: 'Invalid URL pattern format'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes
providerSchema.index({ domain: 1 }, { unique: true });
providerSchema.index({ patterns: 1 });
providerSchema.index({ isActive: 1 });

const Provider = model<IProvider>('Provider', providerSchema);

export default Provider; 